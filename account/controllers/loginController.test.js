'use strict';
require('./../../config/config.js');

const request = require('supertest');
const expect = require('expect');

const {app, initServer, closeServer} = require('./../../server.js');
const {getDb, initDb} = require('./../../db');
const {userService} = require('./../services');
const {userRepository} = require('./../repository');
const {LoginCredentials} = require('./../models');
const {logObj} = require('./../../utils');
const {domains} = require('./../errors');

const usersCollections = process.env.MONGODB_NAME;

describe('loginController',()=>{

	let userRequest;
	let credentials;
	let user;

    before((done)=>{
        initDb()
            .then(()=>done())
            .catch((e)=>done(e));
    });

	beforeEach(async ()=>{
		await getDb().collection(usersCollections).remove({});

		userRequest = {
			email: 'test@gmail.com',
			password: 'I23456789o@',
			firstName: 'Joe',
			lastName: 'Blogs'
		}

		credentials = new LoginCredentials({email: userRequest.email, password: userRequest.password});

		user = await userService.createUser(userRequest);
		user = await userService.verifyUser(user.getVerifyEmailToken().token);
	});

	describe('login',()=>{

		it('should set authorization header if credentials are correct',(done)=>{

			request(app)
				.post('/users/login')
				.send(credentials)
				.expect(200, (err,resp)=>{
					userRepository.findUserWithEmail(user.email)
					.then((user)=>{
						expect(resp.header.authorization).toEqual(user.getAuthToken().token);
						done();
					}).catch((e)=>done(e));;
				});
		
		});

		it('should return invalid credentials if credentials are incorrect',(done)=>{

			credentials.password = 'null';

			request(app)
				.post('/users/login')
				.send(credentials)
				.expect(401, (err,resp)=>{
					const errorResponse = JSON.parse(resp.text);
					expect(errorResponse.code).toBe(domains.account.login.invalidCredentials.code);
					done();
				});

		});

		it('should return validation error if credentials are invalid',(done)=>{

			delete credentials.password;

			request(app)
				.post('/users/login')
				.send(credentials)
				.expect(401, (err,resp)=>{
					const errorResponse = JSON.parse(resp.text);
					expect(errorResponse.code).toBe(domains.account.login.validation.code);
					done();
				});

		});

		it('should return account not found if credentials dont exist',(done)=>{

			credentials.email = 'null@null.com';

			request(app)
				.post('/users/login')
				.send(credentials)
				.expect(401, (err,resp)=>{
					const errorResponse = JSON.parse(resp.text);
					expect(errorResponse.code).toBe(domains.account.login.accountNotFound.code);
					done();
				});

		});

		it('should return account not verified if credentials exist but account not verified',(done)=>{

			getDb()
				.collection(usersCollections)
				.update({email: user.email},{$set: {'isActive':false}})
				.then(()=>{
					request(app)
					.post('/users/login')
					.send(credentials)
					.expect(401, (err,resp)=>{
						const errorResponse = JSON.parse(resp.text);
						expect(errorResponse.code).toBe(domains.account.login.accountUnverified.code);
						done();
					});
				});

		});

	});

	describe('logout',()=>{

		let token;

		beforeEach(async ()=>{
			user = await userService.login(credentials);
			token = user.getAuthToken().token;
		});

		it('should delete token of logged out user',(done)=>{

			request(app)
				.post('/users/logout')
				.set('Authorization',token)
				.send()
				.expect(204)
				.end((err,resp)=>{
					if(err){
						return done(err);
					}
					done();
				});

		});

		it('should return authorization error if user not logged in',(done)=>{

			request(app)
				.post('/users/logout')
				.send()
				.expect(401)
				.end((err,resp)=>{
					if(err){
						return done(err);
					}

					const errorResponse = JSON.parse(resp.text);
					expect(errorResponse.code).toBe(domains.account.login.unauthorizedAccess.code);
					done();
				});
		});

		it('should return error if token does not exist',(done)=>{

			request(app)
				.post('/users/logout')
				.set('Authorization','null')
				.send()
				.expect(401)
				.end((err,resp)=>{
					if(err){
						return done(err);
					}

					const errorResponse = JSON.parse(resp.text);
					expect(errorResponse.code).toBe(domains.account.login.unauthorizedAccess.code);
					done();
				});

		});
	});
});