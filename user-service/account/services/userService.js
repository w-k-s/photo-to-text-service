"use strict"

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const owasp = require('owasp-password-strength-test');

const {User, Token} = require('./../models');
const {WeakPasswordError, InvalidTokenError, TokenNotFoundError} = require('./../errors');
const {userRepository} = require('./../repository');

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const jwtSignature = process.env.JWT_SECRET;
const authExpirySeconds = parseInt(process.env.AUTH_EXP_SECONDS);
const verifyEmailExpirySeconds = parseInt(process.env.EMAIL_VERIFICATION_EXP_SECONDS);

const createUser = async function(obj){
	
	validatePassword(obj.password);
	obj.password = await encryptPassword(obj.password);

	obj.isActive = false;
	obj.isStaff = false;
	
	let user = await User.validate(obj);
	user._id = await userRepository.saveUser(user);
	user.tokens.push(generateAuthToken(user._id));
	user.tokens.push(generateVerificationToken(user.email))
	userRepository.updateUser(user);
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
	expiryDate.setSeconds(expiryDate.getSeconds() + authExpirySeconds);	

	return new Token({access: 'verify',token,expiry: expiryDate.getTime()/1000})
}

const validatePassword = function(password){
	if(!password) return;

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

	const res = await userRepository.userWithVerificationToken(verificationToken);
	if(!res){
		throw new TokenNotFoundError();
	}
	res._id = res._id.toHexString();
	const user = User.validate(res);
	
	try{
		jwt.verify(user.getVerifyEmailToken().token,jwtSignature);
	}catch(e){
		throw new InvalidTokenError(e);
	}finally{
		//TODO: remove verification token in both cases (valid / invalid)
	}

	user.isActive = true;
	userRepository.updateUser(user);
	return user;
}

module.exports = {
	createUser,
	verifyUser
}