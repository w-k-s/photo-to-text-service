'use strict';

const expect = require('expect');
const request = require('supertest');

const {
    server,
    initServer
} = require('./../../server.js');

describe('HomeController', () => {

    before(async () => {
        await initServer();
    });

    describe('home', () => {

        it('should return 200 with some text in the body', (done) => {

            request(server.listener)
                .get('/home')
                .send()
                .expect(200, (err, resp) => {
                    expect(resp.text).toBeTruthy()
                    done();
                });
        });
    });
});