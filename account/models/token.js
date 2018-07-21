"use strict";
const Joi = require('joi');

const {
    validateJoiResult
} = require('./utils.js');

const validAccessTypes = ['auth', 'verify'];

const tokenSchema = Joi.object().keys({
    access: Joi.string().valid(validAccessTypes).required(),
    token: Joi.string().required(),
    expiry: Joi.date().timestamp('unix').required()
});


class Token {
    constructor({
        access,
        token,
        expiry
    }) {
        Token.validate(arguments[0]);
        this.access = access;
        this.token = token;

        if (expiry instanceof Date) {
            this.expiry = parseInt(expiry.getTime() / 1000);
        } else {
            this.expiry = expiry;
        }
    }

    static validate({
        access,
        token,
        expiry
    }) {
        validateJoiResult(Joi.validate(arguments[0], tokenSchema));
    }
}

module.exports = {
    Token,
    validAccessTypes
}