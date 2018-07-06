"use strict"
const Joi = require('Joi');

const {validateJoiResult} = require('./utils.js')

const tokenSchema = Joi.object().keys({
	access: Joi.string().valid('auth','verify').required(),
	token: Joi.string().required(),
	expiry: Joi.date().timestamp('unix').required()
});

class Token{

	constructor({access, token, expiry}={}){
		this.access = access;
		this.token = token;
		this.expiry = expiry
	}

	static validate(obj){
		debugger;
		const result = Joi.validate(obj, tokenSchema);
		validateJoiResult(result);
		return new Token(result.value);
	}
}

module.exports = Token