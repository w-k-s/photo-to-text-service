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
} = require('./../services');
const emailService = require('./../../services');
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
    TokenNotFoundError,
    ReverifyingActiveAccountError
} = require('./../errors');

class RegistrationController {

    static async createUser(req, res) {
        const body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName']);
        try {
            const user = await userService.createUser(body);
            RegistrationController.sendVerificationEmail(req, user);

            return res.status(201)
                    .send(new UserResponse(user))
                
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

            return res.status(status)
                    .send(resp);
                
        }
    }

    static async verifyAccount(req, res) {
        try {
            const verificationToken = req.params.token;
            const user = await userService.verifyUser(verificationToken);
            return res.send(new UserResponse(user));
        } catch (e) {

            let status = 500;
            let resp = new ErrorResponse(domains.account.verification.undocumented, e.message)

            if (e instanceof TokenNotFoundError) {
                resp = new ErrorResponse(domains.account.verification.tokenNotFound, e.message)
                status = 404;
            } else if (e instanceof InvalidTokenError) {
                resp = new ErrorResponse(domains.account.verification.tokenNotValid, e.message)
                status = 400;
            } else if (e instanceof ReverifyingActiveAccountError) {
                resp = new ErrorResponse(domains.account.verification.accountAlreadyActive, e.message)
                status = 400;
            }

            return res.status(status)
                    .send(resp);
        }
    }

    static async resendVerificationCode(req, res) {
        try {
            const resendRequest = new VerificationCodeRequest(req.body);
            const user = await userService.recreateVerificationCode(resendRequest);
            RegistrationController.sendVerificationEmail(req, user);
            return res.send(new UserResponse(user));
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

            return res.status(status)
                    .send(resp);
        }
    }

    static async sendVerificationEmail(req, user) {

        const verifyEmailToken = user.getVerifyEmailToken().token;
        const verifyEmailLink = RegistrationController.verificationUrl(req, verifyEmailToken);

        const message = `<p><a href="${verifyEmailLink}">Verify</a> your email<p>`;
        console.log(message);
        await emailService.queueEmail({
            to: user.email,
            subject: 'Verify your account',
            html: message
        });
    }

    static verificationUrl(req, verifyEmailToken) {

        let port = process.env.PORT === '80'? '' : `:${process.env.PORT}`;

        const scheme = 'http';
        const host = `${req.hostname}${port}`;
        const path = `/users/verify/${verifyEmailToken}`;

        return `${scheme}://${host}${path}`;
    }
}

module.exports = RegistrationController;