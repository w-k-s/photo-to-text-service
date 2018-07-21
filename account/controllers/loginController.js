'use strict';

const _ = require('lodash');

const {
    contentTypeJson
} = require('./validation.js');

const {
    LoginCredentials,
    ErrorResponse,
    UserResponse
} = require('./../models');

const {
    userService
} = require('./../services');

const {
    logObj
} = require('./../../utils');

const {
    ValidationError,
    IncorrectPasswordError,
    UnauthorizedAccessError,
    AccountNotFoundError,
    AccountNotVerifiedError,
    domains
} = require('./../errors');

class LoginController {

    static async login(req, h) {
        try {
            const credentials = new LoginCredentials(req.payload);
            const user = await userService.login(credentials);
            return h.response(new UserResponse(user))
                    .header('Authorization', user.getAuthToken().token);
        } catch (e) {
            let status = 500;
            let resp = new ErrorResponse(domains.account.login.undocumented, e.message);

            if (e instanceof ValidationError) {
                resp = new ErrorResponse(domains.account.login.validation, undefined, e.fields)
                status = 400;

            } else if (e instanceof AccountNotFoundError) {
                resp = new ErrorResponse(domains.account.login.accountNotFound, e.message)
                status = 404;
            } else if (e instanceof IncorrectPasswordError) {
                resp = new ErrorResponse(domains.account.login.invalidCredentials)
                status = 401;
            } else if (e instanceof AccountNotVerifiedError) {
                resp = new ErrorResponse(domains.account.login.accountUnverified)
                status = 401;
            }

            return h.response(resp)
                .code(status);
        }
    }

    static async authenticate(req,h){
        debugger;
        try{
            const user = await userService.authenticate(req.headers.authorization);
            return h.authenticated({credentials: new UserResponse(user)});
        }catch(e){
            let status = 500;
            let resp = new ErrorResponse(domains.account.login.undocumented, e.message);

            if (e instanceof UnauthorizedAccessError) {
                resp = new ErrorResponse(domains.account.login.unauthorizedAccess, 'Invalid or empty Authorization token');
                status = 401;
            } else if (e instanceof AccountNotVerifiedError) {
                resp = new ErrorResponse(domains.account.login.accountUnverified, 'Account not activated');
                status = 401;
            } else if (e instanceof InvalidTokenError) {
                resp = new ErrorResponse(domains.account.login.sessionExpired, e.message);
                status = 401;
            }

            return h.unauthenticated()
        }
    }

    static async logout(req, h) {
        try {

        } catch (e) {

        }
    }

    static async isAuthenticated(req, h) {
        try {

        } catch (e) {

        }
    }
}

module.exports = {
    authenticate: LoginController.authenticate,
    login: {
        method: 'POST',
        path: '/users/login',
        handler: LoginController.login,
        options: {
            validate: {
                headers: contentTypeJson
            }
        }
    },
    logout: {
        method: 'POST',
        path: '/users/logout',
        handler: LoginController.logout
    }
}