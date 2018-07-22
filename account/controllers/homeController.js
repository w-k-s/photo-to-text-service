'use strict';

class HomeController {

    static home(req, res) {
        return res.send(`User API`);
    }
}

module.exports = HomeController;