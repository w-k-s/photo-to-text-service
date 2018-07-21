'use strict';

const _ = require('lodash');

const User = require('./user.js');

class UserResponse {
    constructor(user) {
        User.validate(user);
        const resp = _.omit(user, ['password', 'tokens']);
        for (var key in resp) {
            this[key] = resp[key];
        }
    }
}

module.exports = UserResponse;