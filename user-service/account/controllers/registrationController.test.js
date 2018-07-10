'use strict';

const expect = require('expect');
const request = require('supertest');

require('./../../config/config.js');
const {server, initServer} = require('./../../server.js');
const {userService} = require('./../services');
const {getDb} = require('./../../db');
const {domains} = require('./../errors');
const {logObj} = require('./../../utils');

describe('RegistrationController',()=>{

  before(async ()=>{
    await initServer();
  });

  describe('createUser',()=>{

    let body;

    beforeEach(async ()=>{
      body = {
        email: 'test@gmail.com',
        password: '@I23456789o',
        firstName: 'Joe',
        lastName: 'blogs'
      };
      await getDb().collection(process.env.MONGODB_NAME).remove({email: body.email})
    });

    it('should return 400 if email is not sent',(done)=>{

      delete body.email;
      request(server.listener)
        .post('/users')
        .set('content-type','application/json')
        .send(body)
        .expect(400, (err,resp)=>{
          const errorResponse = JSON.parse(resp.text);
          expect(errorResponse.code).toBe(domains.account.registration.validation.code);
          expect(errorResponse.path).toBe(domains.account.registration.validation.path);
          expect(errorResponse.userInfo.email).toBeTruthy();
          done();
        });
    });

    it('should return 400 if password is not sent',(done)=>{

      delete body.password
      request(server.listener)
        .post('/users')
        .set('content-type','application/json')
        .send(body)
        .expect(400, (err,resp)=>{
          const errorResponse = JSON.parse(resp.text);
          expect(errorResponse.code).toBe(domains.account.registration.validation.code);
          expect(errorResponse.path).toBe(domains.account.registration.validation.path);
          expect(errorResponse.userInfo.password).toBeTruthy();
          done();
        });
    });

    it('should return 400 if password is weak',(done)=>{

      body.password = '123456'
      request(server.listener)
        .post('/users')
        .set('content-type','application/json')
        .send(body)
        .expect(400, (err,resp)=>{
          const errorResponse = JSON.parse(resp.text);
          expect(errorResponse.code).toBe(domains.account.registration.validation.code);
          expect(errorResponse.path).toBe(domains.account.registration.validation.path);
          expect(errorResponse.userInfo.password).toBeTruthy();
          done();
        });
    });

    it('should return 400 if firstName is not sent',(done)=>{

      delete body.firstName
      request(server.listener)
        .post('/users')
        .set('content-type','application/json')
        .send(body)
        .expect(400, (err,resp)=>{
          const errorResponse = JSON.parse(resp.text);
          expect(errorResponse.code).toBe(domains.account.registration.validation.code);
          expect(errorResponse.path).toBe(domains.account.registration.validation.path);
          expect(errorResponse.userInfo.firstName).toBeTruthy();
          done();
        });
    });

    it('should return 400 if lastName is not sent',(done)=>{

      delete body.lastName
      request(server.listener)
        .post('/users')
        .set('content-type','application/json')
        .send(body)
        .expect(400, (err,resp)=>{
          const errorResponse = JSON.parse(resp.text);
          expect(errorResponse.code).toBe(domains.account.registration.validation.code);
          expect(errorResponse.path).toBe(domains.account.registration.validation.path);
          expect(errorResponse.userInfo.lastName).toBeTruthy();
          done();
        });
    });

    it('should return 400 if account already exists',(done)=>{

      userService.createUser(body).then(()=>{
        request(server.listener)
        .post('/users')
        .set('content-type','application/json')
        .send(body)
        .expect(400, (err,resp)=>{
          const errorResponse = JSON.parse(resp.text);
          expect(errorResponse.code).toBe(domains.account.registration.duplicateAccount.code);
          expect(errorResponse.path).toBe(domains.account.registration.duplicateAccount.path);
          done();
        });
      }).catch((e)=> {
        done(e)
      });
    });

    it('should return 201 and user without tokens and passwords if user created successfully',(done)=>{

      request(server.listener)
      .post('/users')
      .set('content-type','application/json')
      .send(body)
      .expect(201, (err,resp)=>{
        const user = JSON.parse(resp.text);
        expect(user._id).toBeTruthy();
        expect(user.firstName).toEqual(body.firstName);
        expect(user.lastName).toEqual(body.lastName);
        expect(user.email).toEqual(body.email);
        expect(resp.password).toBeFalsy();
        expect(resp.tokens).toBeFalsy();
        done();
      });

    });

  });
});