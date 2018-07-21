'use strict'
const Joi = require('joi');

const {
    validateJoiResult
} = require('./utils.js')

const verificationCodeRequestSchema = Joi.object().keys({
    email: Joi.string().email().required(),
});


class VerificationCodeRequest {
    constructor({
        email
    }) {
        VerificationCodeRequest.validate(arguments[0]);
        this.email = email;
    }

    static validate() {
        validateJoiResult(Joi.validate(arguments[0],
            verificationCodeRequestSchema));
    }
}

module.exports = VerificationCodeRequest;