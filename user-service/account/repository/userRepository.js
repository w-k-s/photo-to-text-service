'use strict';
const _ = require('lodash');
const assert = require('assert').strict;
const {ObjectId} = require('mongodb');

const {getDb} = require('./../../db');
const {User, Token} = require('./../models');
const {DuplicateAccountError} = require('./../errors');

const usersCollection = 'users'
const mongoDuplicateKeyErrorCode = 11000;


const saveUser = async (user)=>{
	const res = await insertUser(user);
	await indexUsers();
	return res;
}

const getUsersCollection = () => {
	return getDb().collection(usersCollection);
}

const insertUser = async (user)=>{
	const obj = {...user};
	try{
		const res = await getUsersCollection().insert(obj)
		return res.insertedIds[0]
	}catch(err){
		if(err.code == mongoDuplicateKeyErrorCode){
			throw new DuplicateAccountError(err)
		}
		throw err;
	}
}

const updateUser = async (user) => {
	assert(user._id);
	assert(user.email);

	let obj = {...user};
	obj = _.omit(obj,'_id');

	try{
		return await getUsersCollection().findOneAndUpdate({_id: ObjectId(user._id), email: user.email},{$set: obj},{returnNewDocument: true})
	}catch(err){
		throw err;
	}
}

const indexUsers = async ()=>{
	await getUsersCollection().createIndex( { 'email': 1 }, { unique: true });
}

const userWithVerificationToken = async (verificationToken) => {
	return await getUsersCollection().findOne({
		'tokens':{$elemMatch: {
			'access':'verify',
			'token':verificationToken
		}}
	});
}

module.exports = {
	saveUser,
	updateUser,
	userWithVerificationToken
};