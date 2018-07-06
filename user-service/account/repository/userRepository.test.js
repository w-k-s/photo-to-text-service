'use strict';
const expect = require('expect');
const {AssertionError} = require('assert');
const {ObjectId} = require('mongodb');

require('./../../config/config.js')
const {initDb,getDb} = require('./../../db');
const {DuplicateAccountError} = require('./../errors');
const userRepository = require('./userRepository.js');
const usersCollection = 'users';

describe('userRepository',()=>{

	before(async ()=>{
		await initDb();
	});

	beforeEach(async ()=>{
		await getDb().collection(usersCollection).remove({})
	});

	describe('saveUser',()=>{

		let user;

		beforeEach(async () => {
			user = {firstName: 'Joe',lastName: 'Blogs',email: 'test@gmail.com'};
			const res = await userRepository.saveUser(user);
			user._id = res.toHexString();
		});

		it('should save user',async ()=>{
			const doc = await getDb().collection(usersCollection).findOne({email: user.email})
			expect(user._id.toString()).toEqual(doc._id.toHexString());
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

		let user;

		beforeEach(async () => {
			user = {firstName: 'Joe',lastName: 'Blogs',email: 'test@gmail.com'};
			const res = await userRepository.saveUser(user);
			user._id = res.toHexString();
		});

		it('should update user', async () => {
			user.firstName = 'Jack';
			user.token = 'token';

			const updatedUser = await userRepository.updateUser(user);
			const doc = await getDb().collection(usersCollection).findOne({_id: ObjectId(user._id)});

			expect(user._id.toString()).toEqual(doc._id.toHexString());
			expect(doc.firstName).toEqual(user.firstName);
			expect(doc.token).toEqual(user.token);
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

		let user;
		let userId;

		beforeEach(async ()=>{
			user = {
				firstName: 'Joe', 
				lastName: 'Blogs', 
				email: 'test@gmail.com',
				tokens: [
					{
						access:'auth',
						token: '213112323'
					},
					{
						access:'verify',
						token: '2332e21e2'
					}
			]};

			const id = await userRepository.saveUser(user);
			userId = id.toHexString();
		});

		it('should return user with matching verify token', async () => {
			const doc = await userRepository.userWithVerificationToken(user.tokens[1].token);
			expect(doc._id.toHexString()).toEqual(userId);
		});

		it('should return null for matching auth token', async () => {
			const doc = await userRepository.userWithVerificationToken(user.tokens[0].token);
			expect(doc).toBeFalsy();
		});

		it('should return null for no matching token', async () => {
			const doc = await userRepository.userWithVerificationToken('3241311232113131213');
			expect(doc).toBeFalsy();
		});
	});
})