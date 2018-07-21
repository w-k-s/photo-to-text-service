const Joi = require('joi');
const _ = require('lodash');
const {
    logObj
} = require('./../../utils');

const {
    VerificationCodeRequest,
    ErrorResponse,
    UserResponse
} = require('./../models');
const {
    userService,
    emailService
} = require('./../services');
const {
    contentTypeJson
} = require('./validation.js');
const {
    domains,
    ValidationError,
    WeakPasswordError,
    DuplicateAccountError,
    InvalidTokenError,
    AccountNotFoundError,
    ReverifyingActiveAccountError
} = require('./../errors');

class RegistrationController {

    static async createUser(req, h) {
        const body = _.pick(req.payload, ['email', 'password', 'firstName', 'lastName']);
        try {
            const user = await userService.createUser(body);
            RegistrationController.sendVerificationEmail(req, user);

            return h.response(new UserResponse(user))
                .code(201)
        } catch (e) {
            let status = 500;
            let resp = new ErrorResponse(domains.account.registration.undocumented, e.message);

            if (e instanceof ValidationError) {
                resp = new ErrorResponse(domains.account.registration.validation, undefined, e.fields)
                status = 400;
            } else if (e instanceof DuplicateAccountError) {
                resp = new ErrorResponse(domains.account.registration.duplicateAccount)
                status = 400;
            }

            return h.response(resp)
                .code(status);
        }
    }

    static async verifyAccount(req, h, err) {
        try {
            const verificationToken = req.params.token;
            const user = await userService.verifyUser(verificationToken);
            return new UserResponse(user);
        } catch (e) {
            logObj('Error on verifyAccount', e);
            let status = 500;
            let resp = new ErrorResponse(domains.account.verification.undocumented, e.message)

            if (e instanceof AccountNotFoundError) {
                resp = new ErrorResponse(domains.account.verification.accountNotFound, e.message)
                status = 404;
            } else if (e instanceof InvalidTokenError) {
                resp = new ErrorResponse(domains.account.verification.tokenNotValid, e.message)
                status = 400;
            } else if (e instanceof ReverifyingActiveAccountError) {
                resp = new ErrorResponse(domains.account.verification.accountAlreadyActive, e.message)
                status = 400;
            }

            return h.response(resp)
                .code(status);
        }
    }

    static async resendVerificationCode(req, h, err) {
        try {
            const resendRequest = new VerificationCodeRequest(req.payload);
            const user = await userService.recreateVerificationCode(resendRequest);
            RegistrationController.sendVerificationEmail(req, user);
            return new UserResponse(user);
        } catch (e) {
            let status = 500;
            let resp = new ErrorResponse(domains.account.verification.undocumented, e.message)

            if (e instanceof AccountNotFoundError) {
                resp = new ErrorResponse(domains.account.verification.accountNotFound, e.message)
                status = 404;
            } else if (e instanceof ReverifyingActiveAccountError) {
                resp = new ErrorResponse(domains.account.verification.accountAlreadyActive, e.message)
                status = 400;
            } else if (e instanceof ValidationError) {
                resp = new ErrorResponse(domains.account.verification.validation, undefined, e.fields)
                status = 400;
            }

            return h.response(resp)
                .code(status);
        }
    }

    static async sendVerificationEmail(req, user) {

        const verifyEmailToken = user.getVerifyEmailToken().token;
        const verifyEmailLink = RegistrationController.verificationUrl(req, verifyEmailToken);

        //TODO: use message queue, and use template
        const message = `<p><a href="${verifyEmailLink}">Verify</a> your email<p>`;
        console.log(message);
        await emailService.sendEmail({
            to: user.email,
            subject: 'Verify your account',
            html: message
        });
    }

    static verificationUrl(req, verifyEmailToken) {
        const scheme = 'http';
        const host = req.info.host;
        const path = `/users/verify/${verifyEmailToken}`;

        return `${scheme}://${host}${path}`;
    }
}

module.exports = {
    createUser: {
        method: 'POST',
        path: '/users',
        handler: RegistrationController.createUser,
        options: {
            validate: {
                headers: contentTypeJson
            }
        }
    },
    verifyAccount: {
        method: 'GET',
        path: '/users/verify/{token}',
        handler: RegistrationController.verifyAccount
    },
    resendVerificationCode: {
        method: 'POST',
        path: '/users/resendVerificationCode',
        handler: RegistrationController.resendVerificationCode,
        options: {
            validate: {
                headers: contentTypeJson
            }
        }
    }
}