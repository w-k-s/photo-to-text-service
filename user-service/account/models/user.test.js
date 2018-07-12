'use strict';
const expect = require('expect');

const User = require('./user.js');
const {ValidationError} = require('./../errors')

describe('User',()=>{

	let createDate = new Date();
	let userObj;

	beforeEach(()=>{
		userObj = {
			email: 'test@gmail.com',
			password: '123456',
			firstName: 'Joe',
			lastName: 'Blogs',
			isActive: false,
			isStaff: false,
			createDate,
			lastLogin: null,
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
		]}
	});

	describe('constructor',()=>{

		it('should create user with valid data',()=>{
			const user = new User(userObj);
			expect(user).toBeTruthy();
			expect(user.firstName).toEqual(userObj.firstName);
			expect(user.lastName).toEqual(userObj.lastName);
			expect(user.email).toEqual(userObj.email);
			expect(user.password).toEqual(userObj.password);
			expect(user.isActive).toEqual(userObj.isActive);
			expect(user.isStaff).toEqual(userObj.isStaff);
			expect(user.createDate).toEqual(parseInt(userObj.createDate.getTime()/1000));
			expect(user.lastLogin).toBeFalsy();
			expect(user.tokens.length).toEqual(userObj.tokens.length);
			expect(user.tokens[0].access).toEqual(userObj.tokens[0].access);
			expect(user.tokens[0].token).toEqual(userObj.tokens[0].token);
			expect(user.tokens[0].expiry).toEqual(parseInt(userObj.tokens[0].expiry.getTime()/1000));
		})

		it('should validate id is optional',()=>{
			expect(new User(userObj)).toBeTruthy();
		});

		it('should validate email is required',()=>{
			delete userObj.email;
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate email is valid',()=>{
			userObj.email = 'not an email';
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate password is required',()=>{
			delete userObj.password;
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate firstName is required',()=>{
			delete userObj.firstName;
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate firstName should have length',()=>{
			userObj.firstName = '';
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate firstName is one alphabetic word',()=>{
			userObj.firstName = 'Jsoe 1'
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate lastName is required',()=>{
			delete userObj.lastName;
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate lastName should have length',()=>{
			userObj.lastName = '';
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate lastName is one alphabetic word',()=>{
			userObj.lastName = '2 Blogs'
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate isActive is required',()=>{
			delete userObj.isActive;
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate isStaff is required',()=>{
			delete userObj.isStaff;
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate createDate is required',()=>{
			delete userObj.createDate;
			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

		it('should validate createDate is timestamp',()=>{
			const user = new User(userObj);
			expect(user.createDate).toEqual(parseInt(createDate.getTime()/1000));
		});

		it('should validate lastLogin is optional',()=>{
			userObj.lastLogin = null;
			expect(new User(userObj)).toBeTruthy();
		});

		it('should validate lastLogin is timestamp',()=>{
			const lastLogin = new Date();
			userObj.lastLogin = lastLogin;
			const user = new User(userObj);
			expect(user.lastLogin).toBe(parseInt(lastLogin.getTime()/1000));
		});

		it('should validate tokens defaults to empty array',()=>{
			delete userObj.tokens;
			const user = new User(userObj);
			expect(user.tokens).toEqual([]);
		});

		it('should validate tokens are valid',()=>{
			delete userObj.tokens[0].token;
			delete userObj.tokens[0].access;

			expect(()=>{
				new User(userObj)
			}).toThrow(ValidationError);
		});

	});

	describe('getVerifyEmailToken',()=>{

		it('should return token with access type verify',()=>{
			const user = new User(userObj);
			const token = user.getVerifyEmailToken();
			expect(token).toBeTruthy();
			expect(token.access).toEqual('verify');
		})
	});

	describe('getAuthToken',()=>{

		it('should return token with access type auth',()=>{
			const user = new User(userObj);
			const token = user.getAuthToken();
			expect(token).toBeTruthy();
			expect(token.access).toEqual('auth');
		})
	})

});