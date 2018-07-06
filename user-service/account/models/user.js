const _ = require('lodash')
const Joi = require('Joi')

const Token = require('./token.js')
const {validateJoiResult} = require('./utils.js')

const userSchema = Joi.object().keys({
	_id: Joi.string().default(null),
	email: Joi.string().email().required(),
	password: Joi.string().required(),
	firstName: Joi.string().regex(/^[A-Z]*[a-z]*/).min(1).required(),
	lastName: Joi.string().regex(/^[A-Z]*[a-z]*/).min(1).required(),
	isActive: Joi.boolean().default(false).required(),
	isStaff: Joi.boolean().default(false).required(),
	createDate: Joi.date().timestamp('unix').default(Date.now()/1000),
	lastLogin: Joi.date().timestamp('unix').optional().allow(null),
	tokens: Joi.array().default([])
});

class User{

	constructor({id, email, password, firstName, lastName, isActive = false, isStaff = false, createDate = Date.now(), lastLogin, tokens = new Array()}={}){
		this._id = id;
		this.email = email;
		this.password = password;
		this.firstName = firstName;
		this.lastName = lastName;
		this.isActive = isActive;
		this.isStaff = isStaff;
		this.createDate = createDate;
		this.lastLogin = lastLogin;
		this.tokens = tokens
	}

	getVerifyEmailToken(){
		return this.tokens.filter((token)=>token.access === "verify")[0];
	}

	static validate(obj){
		if(obj.tokens && obj.tokens.length){
			obj.tokens.forEach((token)=>{ Token.validate(token)});
		}
		const result = Joi.validate(obj, userSchema);
		validateJoiResult(result);
		return new User(result.value);
	}
}

module.exports = User