"use strict"

const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcrypt')
const owasp = require('owasp-password-strength-test');
const assert = require('assert').strict;

const {logObj} = require('./../../utils');
const {User, Token} = require('./../models');
const {userRepository} = require('./../repository');
const {
	ValidationError,
	WeakPasswordError, 
	InvalidTokenError, 
	TokenNotFoundError,
	AccountNotFoundError
} = require('./../errors');

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const jwtSignature = process.env.JWT_SECRET;
const authExpirySeconds = parseInt(process.env.AUTH_EXP_SECONDS);
const verifyEmailExpirySeconds = parseInt(process.env.EMAIL_VERIFICATION_EXP_SECONDS);

const createUser = async function(obj){
	checkPasswordStrength(obj.password);
	obj.password = await encryptPassword(obj.password);

	obj.isActive = false;
	obj.isStaff = false;
	obj.createDate = new Date();
	
	let user = new User(obj);
	user._id = await userRepository.saveUser(user);
	user.tokens.push(generateAuthToken(user._id));
	user.tokens.push(generateVerificationToken(user.email))
	await userRepository.updateUser(user);
	return user;
}

const generateAuthToken = (id) => {
	const token = jwt.sign({
		id: id
	},jwtSignature, { expiresIn: authExpirySeconds });

	const expiryDate = new Date()
	expiryDate.setSeconds(expiryDate.getSeconds() + authExpirySeconds);

	return new Token({access: 'auth',token, expiry: expiryDate.getTime()/1000});
}

const generateVerificationToken = (email) => {
	const token = jwt.sign({
		email: email
	}, jwtSignature, {expiresIn: verifyEmailExpirySeconds});

	const expiryDate = new Date()
	expiryDate.setSeconds(expiryDate.getSeconds() + verifyEmailExpirySeconds);	

	return new Token({access: 'verify',token,expiry: expiryDate.getTime()/1000})
}

const recreateVerificationCode = async (email) => {
	assert(email);

	let user = await userRepository.findUserWithEmail(email);
	if(!user){
		throw new AccountNotFoundError(email);
	}
	user.tokens = user.tokens.filter((token)=> token.access !== 'verify');
	user.tokens.push(generateVerificationToken(user.email));
	return await userRepository.updateUser(user);
}

const checkPasswordStrength = function(password){
	if(!password){
		throw new ValidationError({'password':'password is required'});
	}

	const passwordStrength = owasp.test(password);
	if(!passwordStrength.strong){
		const message = _.join(passwordStrength.errors,'\n');
		throw new WeakPasswordError(message);
	}
}

const encryptPassword = (password) => {
	return new Promise((resolve,reject)=>{
		bcrypt.genSalt(saltRounds, (err,salt)=>{
			if(err){
				reject(err);
				return;
			}
			bcrypt.hash(password,salt,(err,hash)=>{
				if(err){
					reject(err);
					return;
				}
				resolve(hash);
			})
		})
	})
}

const verifyUser = async (verificationToken) => {
	debugger;
	let user = await userRepository.userWithVerificationToken(verificationToken);
	if(!user){
		throw new TokenNotFoundError();
	}
	
	try{
		jwt.verify(user.getVerifyEmailToken().token,jwtSignature);
	}catch(e){
		throw new InvalidTokenError(e);
	}finally{
		user = await userRepository.removeVerificationToken(verificationToken);
	}

	user.isActive = true;
	return await userRepository.updateUser(user);
}

module.exports = {
	createUser,
	verifyUser,
	recreateVerificationCode
}