'use strict'
const Joi = require('Joi');

const {validateJoiResult} = require('./utils.js')

const verificationCodeRequestSchema = Joi.object().keys({
	email: Joi.string().email().required(),
});


class VerificationCodeRequest{
	constructor({email}){
		validateJoiResult(Joi.validate(arguments[0], verificationCodeRequestSchema));
		this.email = email;
	}
}

module.exports = VerificationCodeRequest;