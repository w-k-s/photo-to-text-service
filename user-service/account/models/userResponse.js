'use strict';

const _ = require('lodash');

class UserResponse {
    constructor(user) {
        console.log(`user: ${JSON.stringify(user,undefined,2)}`);
        Object.assign(_.omit(user, ['password', 'tokens']), this);
        console.log(`user: ${JSON.stringify(this,undefined,2)}`);
    }
}

module.exports = UserResponse;