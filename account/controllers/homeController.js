'use strict';

class HomeController {

    static home(req, res) {
        return res.redirect('/docs');
    }
}

module.exports = HomeController;