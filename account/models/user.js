'use strict';
const _ = require('lodash');
const Joi = require('joi');
const assert = require('assert');

const {
    Token
} = require('./token.js')
const {
    validateJoiResult
} = require('./utils.js')

const userSchema = Joi.object().keys({
    _id: Joi.string().default(null),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().regex(/^[A-Z]*[a-z]*$/).required(),
    lastName: Joi.string().regex(/^[A-Z]*[a-z]*$/).required(),
    isActive: Joi.boolean().default(false).required(),
    isStaff: Joi.boolean().default(false).required(),
    createDate: Joi.date().timestamp('unix').required(),
    lastLogin: Joi.date().timestamp('unix').optional().allow(null),
    tokens: Joi.array().default([])
});

class User {

    constructor({
        _id,
        email,
        password,
        firstName,
        lastName,
        isActive = false,
        isStaff = false,
        createDate = Date.now(),
        lastLogin,
        tokens = new Array()
    }) {
        User.validate(arguments[0]);

        this._id = _id;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.isActive = isActive;
        this.isStaff = isStaff;
        this.tokens = new Array();

        this.createDate = createDate;
        if (createDate instanceof Date) {
            this.createDate = parseInt(createDate.getTime() / 1000);
        }

        if (lastLogin) {
            this.lastLogin = lastLogin;
            if (lastLogin instanceof Date) {
                this.lastLogin = parseInt(lastLogin.getTime() / 1000);
            }
        }

        if (tokens && tokens.length) {
            tokens.forEach((token) => {
                this.tokens.push(new Token(token))
            });
        }
    }

    static validate({
        _id,
        email,
        password,
        firstName,
        lastName,
        isActive = false,
        isStaff = false,
        createDate = Date.now(),
        lastLogin,
        tokens = new Array()
    }) {
        validateJoiResult(Joi.validate(arguments[0], userSchema));
    }

    getVerifyEmailToken() {
        return this.tokens.filter((token) => token.access === "verify")[0];
    }

    setVerifyEmailToken(token) {
        Token.validate(token);
        assert(token.access === 'verify');

        _.remove(this.tokens, (token) => token.access === 'verify');
        this.tokens.push(token);
    }

    getAuthToken() {
        return this.tokens.filter((token) => token.access === "auth")[0];
    }

    setAuthToken(token) {
        Token.validate(token);
        assert(token.access === 'auth');

        _.remove(this.tokens, (token) => token.access === 'auth');
        this.tokens.push(token);
    }
}

module.exports = User