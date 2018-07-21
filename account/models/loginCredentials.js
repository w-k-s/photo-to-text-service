'use strict';

const _ = require('lodash');
const Joi = require('joi');

const {
    validateJoiResult
} = require('./utils.js');

const credentialsSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

class LoginCredentials {

    constructor({
        email,
        password
    }) {
        LoginCredentials.validate(arguments[0]);
        this.email = email;
        this.password = password;
    }

    static validate({
        email,
        password
    }) {
        validateJoiResult(Joi.validate(arguments[0], credentialsSchema));
    }
}

module.exports = LoginCredentials;