"use strict"

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const owasp = require('owasp-password-strength-test');

const {User, Token} = require('./../models');
const {WeakPasswordError} = require('./../repository/error.js');
const userRepository = require('./../repository/userRepository.js');

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const jwtSignature = process.env.JWT_SECRET;
const jwtExpirySeconds = process.env.JWT_EXP_SECONDS;

const createUser = async function(obj){
	
	validatePassword(obj.password);
	obj.password = await encryptPassword(obj.password);

	obj.isActive = false;
	obj.isStaff = false;
	
	let user = await User.validate(obj);
	console.log(`user instanceof User: ${user instanceof User}`);
	console.log(`user: ${JSON.stringify(user,undefined,2)}`)
	user._id = await userRepository.saveUser(user);
	const token = generateToken(user._id);
	console.log(`token: ${JSON.stringify(token,undefined,2)}`);
	user.tokens.push(token);
	console.log(`createUser Success: ${JSON.stringify(user,undefined,2)}`);
	return user;
}

const generateToken = (id) => {
	const token = jwt.sign({
		id: id
	},jwtSignature, { expiresIn: jwtExpirySeconds });
	return new Token({access: 'auth',token});
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

module.exports = {
	createUser
}