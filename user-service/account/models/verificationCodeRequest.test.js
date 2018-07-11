'use strict';
const expect = require('expect');

const ResendVerificationCodeRequest = require('./verificationCodeRequest.js');

describe('ResendVerificationCodeRequest',()=>{

	describe('constructor',()=>{

		it('should validate email is present',()=>{
			
			expect(()=>{
				new ResendVerificationCodeRequest();
			}).toThrow();
		});

		it('should validate email is valid',()=>{

			expect(()=>{
				new ResendVerificationCodeRequest({email: ' '});
			}).toThrow();
		});

		it('should construct instance if email is valid',()=>{
			const email = 'test@gmail.com';
			const resendRequest = new ResendVerificationCodeRequest({email});
			expect(resendRequest.email).toEqual(email);
		});
	});

});