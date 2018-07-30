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
    InvalidTokenError,
    IncorrectPasswordError,
    UnauthorizedAccessError,
    AccountNotFoundError,
    AccountNotVerifiedError,
    domains
} = require('./../errors');

class LoginController {

    static async login(req, res) {
    
        try {
            const credentials = new LoginCredentials(req.body);
            const user = await userService.login(credentials);
            return res
                    .header('Authorization', user.getAuthToken().token)
                    .send(new UserResponse(user));
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

            return res
                .status(status)
                .send(resp);
        }
    }

    static async authenticate(req,res,next){
        debugger;
        try{
            req.user = await userService.authenticate(req.headers.authorization);
            next();
        }catch(e){
            let status = 500;
            let resp = new ErrorResponse(domains.account.login.undocumented, e.message);

            if (e instanceof UnauthorizedAccessError) {
                resp = new ErrorResponse(domains.account.login.unauthorizedAccess, 'Token is missing or unauthorized');
                status = 401;
            } else if (e instanceof AccountNotVerifiedError) {
                resp = new ErrorResponse(domains.account.login.accountUnverified, 'Account not activated');
                status = 401;
            } else if (e instanceof InvalidTokenError) {
                resp = new ErrorResponse(domains.account.login.sessionExpired, e.message);
                status = 401;
            }

            return res
                    .status(status)
                    .send(resp);
        }
    }

    static async logout(req, res) {
        debugger;
        try{
            await userService.logout(req.user.getAuthToken().token);
            res.sendStatus(204);
        }catch(e){
            res
                .status(500)
                .send(new ErrorResponse(domains.account.login.undocumented,e));
        }
    }
}

module.exports = LoginController;