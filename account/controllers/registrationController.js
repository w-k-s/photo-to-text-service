const Joi = require('joi');
const _ = require('lodash');
var path    = require("path");
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
const {emailService, ChannelClosedError} = require('./../../services');
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

const error = domains.account;

class RegistrationController {

    static async createUser(req, res) {
        const body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName']);
        try {
            const user = await userService.createUser(body);
            await RegistrationController.sendVerificationEmail(req, user);
            return res.status(201)
                    .send(new UserResponse(user))
                
        } catch (e) {
            let status = 500;
            let resp = new ErrorResponse(error.registration.undocumented, e.message);

            if (e instanceof ValidationError) {
                resp = new ErrorResponse(error.registration.validation, undefined, e.fields)
                status = 400;
            } else if (e instanceof DuplicateAccountError) {
                resp = new ErrorResponse(error.registration.duplicateAccount);
                status = 400;
            } else if (e instanceof ChannelClosedError){
                resp = new ErrorResponse(error.verification.verificationCodeNotSent);
            }

            return res.status(status)
                    .send(resp);
                
        }
    }

    static async verifyAccount(req, res) {
        try {
            const verificationToken = req.params.token;
            const user = await userService.verifyUser(verificationToken);
            return res.sendFile(path.join(__dirname+'/templates/verified.html'));
        } catch (e) {

            let status = 500;
            let resp = new ErrorResponse(error.verification.undocumented, e.message)

            if (e instanceof TokenNotFoundError) {
                resp = new ErrorResponse(error.verification.tokenNotFound, e.message)
                status = 404;
            } else if (e instanceof InvalidTokenError) {
                resp = new ErrorResponse(error.verification.tokenNotValid, e.message)
                status = 400;
            } else if (e instanceof ReverifyingActiveAccountError) {
                resp = new ErrorResponse(error.verification.accountAlreadyActive, e.message)
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
            await RegistrationController.sendVerificationEmail(req, user);
            return res.send(new UserResponse(user));
        } catch (e) {
            let status = 500;
            let resp = new ErrorResponse(error.verification.undocumented, e.message)

            if (e instanceof AccountNotFoundError) {
                resp = new ErrorResponse(error.verification.accountNotFound, e.message)
                status = 404;
            } else if (e instanceof ReverifyingActiveAccountError) {
                resp = new ErrorResponse(error.verification.accountAlreadyActive, e.message)
                status = 400;
            } else if (e instanceof ValidationError) {
                resp = new ErrorResponse(error.verification.validation, undefined, e.fields)
                status = 400;
            } else if (e instanceof ChannelClosedError){
                resp = new ErrorResponse(error.verification.verificationCodeNotSent);
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