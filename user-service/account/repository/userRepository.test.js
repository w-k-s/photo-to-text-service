'use strict';
const expect = require('expect');
const _ = require('lodash');
const {AssertionError} = require('assert');
const {ObjectId} = require('mongodb');

require('./../../config/config.js');
const {logObj} = require('./../../utils');
const {initDb,getDb} = require('./../../db');
const {User,Token} = require('./../models');
const {DuplicateAccountError} = require('./../errors');
const userRepository = require('./userRepository.js');
const usersCollection = process.env.MONGODB_NAME;

describe('userRepository',()=>{

	let user;
	let userId;

	before(async ()=>{
		await initDb();
		userId = new ObjectId().toHexString();
	});

	beforeEach(async ()=>{
		await getDb().collection(usersCollection).remove({});
		user = new User({
			_id: userId,
			firstName: 'Joe',
			lastName: 'Blogs',
			email: 'test@gmail.com',
			password:'123',
			isActive: false, 
			isStaff: false, 
			createDate: new Date(), 
			tokens: [
				{
					access:'auth',
					token: '213112323',
					expiry: new Date()
				},
				{
					access:'verify',
					token: '2332e21e2',
					expiry: new Date()
				}
		]});

		await userRepository.saveUser(user);
	});

	describe('generateUniqueId',()=>{

		it('should generate unique ids',()=>{
			const length = 1000;
			const ids = [...Array(length)].map(userRepository.generateUniqueId);
			const uniqueIds = _.uniq(ids);
			expect(uniqueIds.length).toBe(ids.length);
		});

	});


	describe('saveUser',()=>{

		it('should save user',async ()=>{
			const doc = await getDb().collection(usersCollection).findOne({email: user.email})
			expect(user._id).toEqual(doc._id.toHexString());
		});
	
		it('should throw DuplicateAccountError when saving users with the same email', async ()=>{
			try{
				await userRepository.saveUser(user);
			}catch(e){
				if(!(e instanceof DuplicateAccountError)){
					throw e;
				}
			}
		});

	});

	describe('updateUser', ()=>{

		it('should update user', async () => {
			user.firstName = 'Jack';
			user.tokens = [new Token({access: 'auth',token:'token',expiry: new Date()})];

			const updatedUser = await userRepository.updateUser(user);
			const doc = await getDb().collection(usersCollection).findOne({_id: ObjectId(user._id)});

			expect(doc._id.toHexString()).toEqual(updatedUser._id);
			expect(doc.firstName).toEqual(user.firstName);
			expect(doc.tokens[0].token).toEqual(user.tokens[0].token);
		});

		it('should throw assertion error user id is undefined',async () => {
			//modifieduser is a copy of user with updates that need to be saved
			const modifiedUser = {...user};
			//update name on modified user
			modifiedUser.firstName = 'Jack';
			modifiedUser.lastName = 'Jogs';
			
			try{
				const updatedUser = await userRepository.updateUser(modifiedUser);
			}catch(e){
				if(!(e instanceof AssertionError)){
					throw e;
				}
			}
		});

		it('should throw assertion error user email is undefined',async () => {
			//modifiedUser is a copy of user with updates that need to be saved
			const modifiedUser = {...user};
			//update name on modified user
			delete modifiedUser.email;
			
			try{
				const updatedUser = await userRepository.updateUser(modifiedUser);
			}catch(e){
				if(!(e instanceof AssertionError)){
					throw e;
				}
			}
		});
	});

	describe('userWithVerificationToken',()=>{

		it('should return user with matching verify token', async () => {
			const matchingUser = await userRepository.userWithVerificationToken(user.tokens[1].token);
			expect(matchingUser instanceof User).toBe(true);
			expect(matchingUser._id).toEqual(user._id);
		});

		it('should return null for matching auth token', async () => {
			const matchingUser = await userRepository.userWithVerificationToken(user.tokens[0].token);
			expect(matchingUser).toBeFalsy();
		});

		it('should return null for no matching token', async () => {
			const matchingUser = await userRepository.userWithVerificationToken('3241311232113131213');
			expect(matchingUser).toBeFalsy();
		});
	});

	describe('removeVerificationToken',()=>{

		it('should remove  matching verify token', async () => {
			const updatedUser = await userRepository.removeVerificationToken(user.tokens[1].token);
			expect(updatedUser instanceof User).toBe(true);
			expect(updatedUser.tokens.length).toBe(1);
			expect(updatedUser.tokens[0].access).toEqual('auth');
		});

	});
	
	describe('findUserWithEmail',()=>{

		it('should find user with email',async ()=>{
			const result = await userRepository.findUserWithEmail(user.email);
			expect(result).toBeTruthy();
			expect(result.email).toEqual(user.email);
		});

		it('should return null if user with email not found',async ()=>{
			const result = await userRepository.findUserWithEmail('abc');
			expect(result).toBeFalsy();
		});
	});
})