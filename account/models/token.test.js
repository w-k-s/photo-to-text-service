'use strict';
const expect = require('expect');

const {
    Token,
    validAccessTypes
} = require('./token.js');

describe('Token', () => {

    describe('constructor', () => {

        it('should create valid token', () => {
            const access = validAccessTypes[0];
            const tokenString = '123';
            const expiry = new Date();
            const token = new Token({
                access,
                token: tokenString,
                expiry
            });
            expect(token).toBeTruthy();
            expect(token.access).toEqual(access);
            expect(token.token).toEqual(tokenString);
            expect(token.expiry).toEqual(parseInt(expiry.getTime() / 1000))
        })

        it('should validate access is required', () => {

            expect(() => {
                new Token({
                    token: '123',
                    expiry: new Date() / 1000
                });
            }).toThrow();
        });

        it('should create tokens with valid access types', () => {
            validAccessTypes.forEach((type) => {
                const token = new Token({
                    access: type,
                    token: '123',
                    expiry: new Date()
                });
                expect(token).toBeTruthy();
            });
        });

        it('should not create tokens with invalid access types', () => {

            expect(() => {
                new Token({
                    access: '1£$321424',
                    token: '123',
                    expiry: new Date() / 1000
                });
            }).toThrow();
        });

        it('should validate token is required', () => {
            expect(() => {
                new Token({
                    access: validAccessTypes[0],
                    expiry: new Date() / 1000
                });
            }).toThrow();
        });

        it('should validate expiry is required', () => {
            expect(() => {
                new Token({
                    access: validAccessTypes[0],
                    token: '123'
                });
            }).toThrow();
        });

        it('should validate expiry is a timestamp', () => {
            expect(() => {
                new Token({
                    access: validAccessTypes[0],
                    token: '123',
                    expiry: '11:22'
                });
            }).toThrow();
        });
    });

});