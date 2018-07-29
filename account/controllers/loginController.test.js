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

		it('Given credentials are correct, When logging in, Then Authorization header is set',(done)=>{

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

		it('Given credentials are incorrect, When logging in, Then IncorrectPasswordError is returned',(done)=>{

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

		it('Given credentials are invalid, When logging in, Then ValidationError is returned',(done)=>{

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

		it('Given credentials do not exist, When logging in, Then AccountNotFound is returned',(done)=>{

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

		it('Given account not verified, When logging in, Then AccountNotVerified is returned',(done)=>{

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

});