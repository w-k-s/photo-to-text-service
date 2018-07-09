'use strict';
const _ = require('lodash');
const assert = require('assert').strict;
const {ObjectId} = require('mongodb');

const {getDb} = require('./../../db');
const {logObj} = require('./../../utils');
const {User, Token} = require('./../models');
const {DuplicateAccountError} = require('./../errors');

const usersCollection = process.env.MONGODB_NAME;
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
	assert(user instanceof User);
	const obj = {...user};
	try{
		const res = await getUsersCollection().insert(obj);
		return res.insertedIds[0].toString();
	}catch(err){
		if(err.code == mongoDuplicateKeyErrorCode){
			throw new DuplicateAccountError(err)
		}
		throw err;
	}
}

const updateUser = async (user) => {
	assert(user instanceof User);
	assert(user._id); 
	assert(user.email);

	let obj = {...user};
	obj = _.omit(obj,'_id');

	try{
		const result =  await getUsersCollection().findOneAndUpdate({_id: ObjectId(user._id), email: user.email},{$set: obj},{returnOriginal: false})
		if(!result){
			return null;
		}
		const updatedObj = result.value;
		updatedObj._id = updatedObj._id.toHexString();
		updatedObj.createDate = new Date();
		return new User(updatedObj);
	}catch(err){
		throw err;
	}
}

const indexUsers = async ()=>{
	await getUsersCollection().createIndex( { 'email': 1 }, { unique: true });
}

const findUserWithEmail = async (email) =>{
	assert(email);

	const obj = await getUsersCollection().findOne({
		'email': email,
	});
	if(!obj){
		return null;
	}
	obj._id = obj._id.toHexString();
	obj.createDate = new Date();
	return new User(obj);
}

const userWithVerificationToken = async (verificationToken) => {
	const obj =  await getUsersCollection().findOne({
		'tokens':{$elemMatch: {
			'access':'verify',
			'token':verificationToken
		}}
	});
	if(!obj){
		return null;
	}
	obj._id = obj._id.toHexString();
	return new User(obj);
}

const removeVerificationToken = async(verificationToken) => {
	const doc = await getUsersCollection().findOneAndUpdate({},{$pull:{
		'tokens':{'token':verificationToken}
	}},{returnOriginal: false});
	const obj = doc.value;
	if(!obj){
		return null;
	}
	obj._id = obj._id.toHexString();
	return new User(obj);
}

module.exports = {
	saveUser,
	updateUser,
	userWithVerificationToken,
	findUserWithEmail,
	removeVerificationToken
};