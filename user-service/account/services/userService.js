"use strict"

const jwt = require('jsonwebtoken');

const Token = require('./../models/token.js');
const UserRepository = require('./../repository/userRepository.js');

const jwtSignature = process.env.JWT_SECRET;
const jwtExpirySeconds = process.env.JWT_EXP_SECONDS;

const createUser = async (user) => {
	let savedUser = await UserRepository.save(user);
	const token = generateToken(savedUser.id);
	savedUser.tokens.push(token);
	return await UserRepository.update(savedUser);
}

const generateToken = (id) => {
	const token = jwt.sign({
		id: id
	},jwtSignature, { expiresIn: jwtExpirySeconds });
	return new Token('auth',token);
}

module.exports = {
	createUser
}