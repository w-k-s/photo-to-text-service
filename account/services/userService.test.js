'use strict';
const expect = require('expect');
const jwt = require('jsonwebtoken');

require('./../../config/config.js');
const {
    User,
    LoginCredentials,
    VerificationCodeRequest
} = require('./../models');
const userService = require('./userService.js');
const userRepository = require('./../repository');
const {
    WeakPasswordError,
    AccountNotFoundError,
    InvalidTokenError,
    ReverifyingActiveAccountError
} = require('./../errors');

const {
    initDb,
    getDb
} = require('./../../db');
const {
    logObj
} = require('./../../utils');
const usersCollection = process.env.MONGODB_NAME;

describe('UserService', () => {

    let obj;

    before(async () => {
        await initDb();
    });

    beforeEach(async () => {
        await getDb().collection(usersCollection).remove({});
        obj = {
            email: 'test@gmail.com',
            password: '@#I23456l89o',
            firstName: 'Joe',
            lastName: 'Blogs'
        };
    });

    describe('createUser', () => {

        beforeEach(async () => {
            await getDb().collection(usersCollection).remove({});
        });

        it('should not mutate the given parameter', async () => {
            const oldPassword = obj.password;
            const user = await userService.createUser(obj);

            expect(obj.password).toEqual(oldPassword);
            expect(obj.isActive).toEqual(undefined);
            expect(obj.isStaff).toEqual(undefined);
            expect(obj.createDate).toEqual(undefined);

            expect(user.password).not.toEqual(oldPassword);
            expect(user.isActive).toBeFalsy();
            expect(user.isStaff).toBeFalsy();
            expect(user.createDate).toBeTruthy();
        });

        it('should create user with isActive set to false', async () => {
            const user = await userService.createUser(obj);
            expect(user.isActive).toBeFalsy();
        });

        it('should create user with encrypted password', async () => {
            //use spy
        });

        it('should create user with isActive set to false', async () => {
            const user = await userService.createUser(obj);
            expect(user.isStaff).toBeFalsy();
        });

        it('should create user with createDate set to now', async () => {
            const user = await userService.createUser(obj);
            expect(parseInt(user.createDate)).toEqual(parseInt(Date.now() /
                1000));
        });

        it('should create user with verify token set', async () => {
            const user = await userService.createUser(obj);
            expect(user.getVerifyEmailToken()).toBeTruthy();
            expect(user.getVerifyEmailToken().access).toEqual('verify');
            expect(user.getVerifyEmailToken().expiry).toBeTruthy();
            expect(user.getVerifyEmailToken().token.length).toBeGreaterThan(
                1);
        });

        it('should create user with _id set', async () => {
            const user = await userService.createUser(obj);
            expect(user._id).toBeTruthy();
            expect(user._id.length).toBeGreaterThan(1);
        });
    });

    describe('generateAuthToken', () => {
        let token;

        beforeEach(async () => {
            const temp = await userService.createUser(obj);
            await userService.verifyUser(temp.getVerifyEmailToken().token);
            const user = await userService.login(new LoginCredentials({
                email: obj.email,
                password: obj.password
            }))
            token = user.getAuthToken();
        });

        it('token should expire in authExpirySeconds', () => {
            const expected = parseInt(Date.now() / 1000 + parseInt(process.env
                .AUTH_EXP_SECONDS));
            const received = parseInt(token.expiry);
            expect(received).toBe(expected);
        });

        it('token should have access type auth', () => {
            expect(token.access).toEqual('auth');
        });

        it('token should have token', () => {
            expect(token.token).toBeTruthy();
            expect(token.token.length).toBeGreaterThan(1);
        });

        it('token expiry and token.token expiry should match', () => {
            let decoded = jwt.decode(token.token);
            const jwtExpiry = parseInt(decoded['exp']);
            const tokenExpiry = parseInt(token.expiry);
            expect(tokenExpiry).toEqual(jwtExpiry);
        });

        it('token.token be valid', () => {
            jwt.verify(token.token, process.env.JWT_SECRET);
        });
    });

    describe('generateVerificationToken', () => {
        let token;

        beforeEach(async () => {
            const user = await userService.createUser(obj);
            token = user.getVerifyEmailToken();
        });

        it('token should expire in authExpirySeconds', () => {
            const expected = parseInt(Date.now() / 1000 + parseInt(process.env
                .EMAIL_VERIFICATION_EXP_SECONDS));
            const received = parseInt(token.expiry);
            expect(received).toBe(expected);
        });

        it('token should have access type auth', () => {
            expect(token.access).toEqual('verify');
        });

        it('token should have token', () => {
            expect(token.token).toBeTruthy();
            expect(token.token.length).toBeGreaterThan(1);
        });

        it('token expiry and token.token expiry should match', () => {
            let decoded = jwt.decode(token.token);
            const jwtExpiry = parseInt(decoded['exp']);
            const tokenExpiry = parseInt(token.expiry);
            expect(tokenExpiry).toEqual(jwtExpiry);
        });

        it('token.token be valid', () => {
            jwt.verify(token.token, process.env.JWT_SECRET);
        });
    });

    describe('checkPasswordStrength', () => {

        it('should throw WeakPasswordError if password is shorter than 10 chars',
            async () => {
                obj.password = 'abc123!@£';
                try {
                    await userService.createUser(obj);
                } catch (e) {
                    if (!(e instanceof WeakPasswordError)) {
                        throw e;
                    }
                }
            });

        it('should throw WeakPasswordError if password only contains numbers',
            async () => {
                obj.password = '1234567890';
                try {
                    await userService.createUser(obj);
                } catch (e) {
                    if (!(e instanceof WeakPasswordError)) {
                        throw e;
                    }
                }
            });

        it('should throw WeakPasswordError if password only contains characters',
            async () => {
                obj.password = 'abcABCabcA';
                try {
                    await userService.createUser(obj);
                } catch (e) {
                    if (!(e instanceof WeakPasswordError)) {
                        throw e;
                    }
                }
            });

        it(
            'should throw WeakPasswordError if password does not contain special character',
            async () => {
                obj.password = 'abcABC1231';
                try {
                    await userService.createUser(obj);
                } catch (e) {
                    if (!(e instanceof WeakPasswordError)) {
                        throw e;
                    }
                }
            });

        it(
            'should create user is password has 10 alphanumeric characters and a special character',
            async () => {
                const user = await userService.createUser(obj);
                expect(user).toBeTruthy();
            });
    });

    describe('recreateVerificationCode', () => {

        let token;
        let user;

        beforeEach(async () => {
            user = await userService.createUser(obj);
            token = user.getVerifyEmailToken();
        });

        it('should assert email is truthy', async () => {

            let name;
            try{
                await userService.recreateVerificationCode(null);
            }catch(e){
                name = e.name;
            }

            expect(name).toEqual('ValidationError');
        });

        it('should throw AccountNotFoundError if no user with email found', async () => {

            let name;
            const resendRequest = new VerificationCodeRequest({
                email: 'null@null.com'
            });

            try{
                await userService.recreateVerificationCode(resendRequest);
            }catch(e){
                name = e.name;
            }
            expect(name).toEqual('AccountNotFoundError');
        });

        it('should throw ReverifyingActiveAccountError if account already active',
            async () => {

                try {
                    const resendRequest = new VerificationCodeRequest({
                        email: user.email
                    });
                    await getDb().collection(usersCollection).update({
                        email: user.email
                    }, {
                        $set: {
                            'isActive': true
                        }
                    });
                    await userService.recreateVerificationCode(resendRequest);
                } catch (e) {
                    if (!(e instanceof ReverifyingActiveAccountError)) {
                        throw e;
                    }
                }
            });

        it('should replace verify token if exists', async () => {
            const originalToken = token;
            const resendRequest = new VerificationCodeRequest({
                email: user.email
            });
            const updatedUser = await userService.recreateVerificationCode(
                resendRequest);
            expect(originalToken).not.toBe(updatedUser.getVerifyEmailToken());
        });

        it('should add verify token if not exists', async () => {
            await getDb().collection(usersCollection).update({
                email: user.email
            }, {
                $set: {
                    'tokens': []
                }
            });

            const resendRequest = new VerificationCodeRequest({
                email: user.email
            });
            const updatedUser = await userService.recreateVerificationCode(
                resendRequest);
            expect(updatedUser.tokens.length).toEqual(1);
            expect(updatedUser.tokens[0].access).toEqual('verify');
        });
    });

    describe('verifyUser', () => {

        let user;

        beforeEach(async () => {
            user = await userService.createUser(obj);
        });

        it('should throw AccountNotFoundError if user with token not found', async () => {
            
            let name;
            try {
                await userService.verifyUser('token');
            } catch (e) {
                name = e.name;
            }

            expect(name).toEqual('AccountNotFoundError');
        });

        it('should throw ReverifyingActiveAccountError if account already active',
            async () => {

                try {
                    await getDb().collection(usersCollection).update({
                        email: user.email
                    }, {
                        $set: {
                            'isActive': true
                        }
                    });
                    await userService.verifyUser(user.getVerifyEmailToken().token);
                } catch (e) {
                    if (!(e instanceof ReverifyingActiveAccountError)) {
                        throw e;
                    }
                }
            });

        it(
            'should throw InvalidTokenError and delete stored token if provided token invalid',
            async () => {
                const invalidToken = user.getVerifyEmailToken().token + '123';
                user.getVerifyEmailToken().token = invalidToken;
                await getDb().collection(usersCollection).findOneAndUpdate({
                    email: user.email
                }, {
                    $set: {
                        'tokens': user.tokens
                    }
                });

                try {
                    await userService.verifyUser(invalidToken);
                } catch (e) {
                    if (!(e instanceof InvalidTokenError)) {
                        throw e;
                    }
                }

                const count = await getDb().collection(usersCollection).count({
                    'tokens': {
                        $elemMatch: {
                            'token': invalidToken
                        }
                    }
                });
                expect(count).toBe(0);
            });

        it('should set isActive to true and delete stored token if provided token is valid',
            async () => {
                const userTokensCount = user.tokens.length;
                const verifiedUser = await userService.verifyUser(user.getVerifyEmailToken()
                    .token);
                expect(verifiedUser.isActive).toBe(true);

                const obj = await getDb().collection(usersCollection).findOne({
                    email: user.email
                });
                expect(verifiedUser.tokens.length).toBe(userTokensCount - 1);
            });

    });


    describe('authenticate',()=>{

        let user;

        beforeEach(async () => {
            user = await userService.createUser(obj);
        });

        afterEach(async () => {
            await getDb().collection(usersCollection).remove({});
        });

        it('should validate that token is present',async ()=>{
            let name;
            try{
                await userService.authenticate(undefined);
            }catch(e){
                name = e.name;
            }

            expect(name).toBeTruthy();
        });

        it('should throw AccountNotFoundError if account not found',async ()=>{
            let name;
            try{
                await userService.authenticate('token');
            }catch(e){
                name = e.name;
            }

            expect(name).toEqual('UnauthorizedAccessError');
        });

        it('should throw AccountNotVerifiedError if account found but not active',async ()=>{

            await getDb().collection(usersCollection).update({
                email: user.email
            },{$set:{
                'isActive':false,
                'tokens':[{
                    'access':'auth',
                    'token':'TOKEN',
                    'expiry':0
                }]
            }});

            let name;
            try{
                await userService.authenticate('TOKEN');
            }catch(e){
                name = e.name;
            }

            expect(name).toEqual('AccountNotVerifiedError');
        });

        it('should throw InvalidTokenError if account found but token is invalid',async ()=>{

            await getDb().collection(usersCollection).update({
                email: user.email
            },{$set:{
                'isActive':true,
                'tokens':[{
                    'access':'auth',
                    'token':'TOKEN',
                    'expiry':0
                }]
            }});

            let name;
            try{
                await userService.authenticate('TOKEN');
            }catch(e){
                name = e.name;
            }

            expect(name).toEqual('InvalidTokenError');
        });

        it('should return user if token is found and account is active',async ()=>{
            
            await userService.verifyUser(user.getVerifyEmailToken().token);
            user = await userService.login(new LoginCredentials({
                email: obj.email,
                password: obj.password
            }));

            const authUser = await userService.authenticate(user.getAuthToken().token);
            expect(authUser._id).toBeTruthy();
            expect(authUser.email).toEqual(obj.email);
            expect(authUser.isActive).toBeTruthy();
        });
    });
});