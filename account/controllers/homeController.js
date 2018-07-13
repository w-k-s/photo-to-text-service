'use strict';

class HomeController {

    static home(request, h) {
        return `User API`;
    }
}

module.exports = {
    home: {
        method: 'GET',
        path: '/',
        handler: HomeController.home
    }
}