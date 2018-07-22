'use strict';

const expect = require('expect');
const request = require('supertest');

const {
    app,
    initServer,
    closeServer
} = require('./../../server.js');

describe('HomeController', () => {

    describe('home', () => {

        it('should return 200 with some text in the body', (done) => {

            request(app)
                .get('/home')
                .send()
                .expect(200, (err, resp) => {
                    expect(resp.text).toBeTruthy()
                    done();
                });
        });
    });
});