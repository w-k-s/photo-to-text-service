"use strict"
const Joi = require('Joi');

const {validateJoiResult} = require('./utils.js')

const tokenSchema = Joi.object().keys({
	access: Joi.string().valid('auth').required(),
	token: Joi.string().required()
});

class Token{

	constructor({access, token}={}){
		this.access = access;
		this.token = token;
	}

	static validate(obj){
		const result = Joi.validate(obj, tokenSchema);
		validateJoiResult(result);
		return new Token(result.value);
	}
}

module.exports = Token