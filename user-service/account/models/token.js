"use strict"
const Joi = require('Joi');

const {validateJoiResult} = require('./utils.js')

const validAccessTypes = ['auth','verify'];

const tokenSchema = Joi.object().keys({
	access: Joi.string().valid(validAccessTypes).required(),
	token: Joi.string().required(),
	expiry: Joi.date().timestamp('unix').required()
});


class Token{
	constructor({access, token, expiry}){
		validateJoiResult(Joi.validate(arguments[0], tokenSchema));
		this.access = access;
		this.token = token;

		if(expiry instanceof Date){
			this.expiry = expiry.getTime()/1000;
		}else{
			this.expiry = expiry;
		}
	}
}

module.exports = {
	Token,
	validAccessTypes
}