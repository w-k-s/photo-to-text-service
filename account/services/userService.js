'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcrypt')
const owasp = require('owasp-password-strength-test');

const {
    logObj
} = require('./../../utils');
const {
    User,
    Token,
    LoginCredentials,
    VerificationCodeRequest
} = require('./../models');
const {
    userRepository
} = require('./../repository');
const {
    ValidationError,
    WeakPasswordError,
    IncorrectPasswordError,
    InvalidTokenError,
    AccountNotFoundError,
    AccountNotVerifiedError,
    UnauthorizedAccessError,
    ReverifyingActiveAccountError
} = require('./../errors');

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const jwtSignature = process.env.JWT_SECRET;
const authExpirySeconds = parseInt(process.env.AUTH_EXP_SECONDS);
const verifyEmailExpirySeconds = parseInt(process.env.EMAIL_VERIFICATION_EXP_SECONDS);

const createUser = async function (obj) {
    try {
        const tempUser = {...obj};
        checkPasswordStrength(tempUser.password);
        tempUser._id = userRepository.generateUniqueId();
        tempUser.password = await encryptPassword(obj.password);
        tempUser.isActive = false;
        tempUser.isStaff = false;
        tempUser.createDate = new Date();

        let user = new User(tempUser);
        user.setVerifyEmailToken(generateVerificationToken(user.email));
        return await userRepository.saveUser(user);
    } catch (e) {
        throw e;
    }
}

const generateVerificationToken = (email) => {
    const token = jwt.sign({
        email: email
    }, jwtSignature, {
        expiresIn: verifyEmailExpirySeconds
    });

    const expiryDate = new Date()
    expiryDate.setSeconds(expiryDate.getSeconds() +
        verifyEmailExpirySeconds);

    return new Token({
        access: 'verify',
        token,
        expiry: expiryDate.getTime() / 1000
    })
}

const recreateVerificationCode = async (resendRequest) => {
    VerificationCodeRequest.validate(resendRequest);

    const email = resendRequest.email;

    let user = await userRepository.findUserWithEmail(email);
    if (!user) {
        throw new AccountNotFoundError(email);
    }
    if (user.isActive) {
        throw new ReverifyingActiveAccountError();
    }
    user.setVerifyEmailToken(generateVerificationToken(user.email));
    return await userRepository.updateUser(user);
}

const checkPasswordStrength = function (password) {
    if (!password) {
        throw new ValidationError({
            'password': 'password is required'
        });
    }

    const passwordStrength = owasp.test(password);
    if (!passwordStrength.strong) {
        const message = _.join(passwordStrength.errors, '\n');
        throw new WeakPasswordError({
            'password': message
        }, message);
    }
}

const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

const comparePasswords = async (plainPassword, encryptedPassword) => {
    return await bcrypt.compare(plainPassword, encryptedPassword);
}

const verifyUser = async (verificationToken) => {
    let user = await userRepository.findUserWithVerificationToken(
        verificationToken);
    if (!user) {
        throw new AccountNotFoundError();
    }
    if (user.isActive) {
        throw new ReverifyingActiveAccountError();
    }

    try {
        jwt.verify(user.getVerifyEmailToken().token, jwtSignature);
    } catch (e) {
        throw new InvalidTokenError(e);
    } finally {
        user = await userRepository.removeVerificationToken(
            verificationToken);
    }

    user.isActive = true;
    return await userRepository.updateUser(user);
}

const login = async (loginCredentials) => {
    LoginCredentials.validate(loginCredentials);

    const email = loginCredentials.email;

    let user = await userRepository.findUserWithEmail(email);
    if (!user) {
        throw new AccountNotFoundError(email);
    }

    if (!user.isActive) {
        throw new AccountNotVerifiedError(email);
    }

    const passwordsMatch = await comparePasswords(loginCredentials.password, user.password);

    if (!passwordsMatch) {
        throw new IncorrectPasswordError();
    }

    user.setAuthToken(generateAuthToken(user._id));
    return await userRepository.updateUser(user);
}

const authenticate = async (authorization) => {

    const user = await userRepository.findUserWithAuthToken(authorization);
    if (!user) {
        throw new UnauthorizedAccessError();
    }

    if (!user.isActive) {
        throw new AccountNotVerifiedError();
    }

    try {
        jwt.verify(user.getAuthToken().token, jwtSignature);
    } catch (e) {
        //TODO: logout
        throw new InvalidTokenError(e);
    }

    return user;
}

const generateAuthToken = (id) => {
    const token = jwt.sign({
        id: id
    }, jwtSignature, {
        expiresIn: authExpirySeconds
    });

    const expiryDate = new Date()
    expiryDate.setSeconds(expiryDate.getSeconds() + authExpirySeconds);

    return new Token({
        access: 'auth',
        token,
        expiry: expiryDate.getTime() / 1000
    });
}

const logout = async (authToken) => {

}

module.exports = {
    createUser,
    verifyUser,
    login,
    logout,
    authenticate,
    recreateVerificationCode
}