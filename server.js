require('./config/config.js')
const Hapi = require('hapi');

const {
    initDb,
    getDb,
    getClient,
    closeDb
} = require('./db/');

const {
    RegistrationController,
    LoginController,
    HomeController
} = require('./account/controllers');

const {
    emailService
} = require('./account/services');

function exitHandler(options, err) {
    if (err) {
        console.log(err.stack);
    }
    if (options.cleanup) {
        console.log('Cleaning...');
        closeDb();
    }
    if (options.exit) {
        console.log('Exiting');
        process.exit();
    }
}

process.on('SIGINT', exitHandler.bind(null, {
    exit: true,
    cleanup: true
}));
process.on('SIGUSR1', exitHandler.bind(null, {
    exit: true,
    cleanup: true
}));
process.on('SIGUSR2', exitHandler.bind(null, {
    exit: true,
    cleanup: true
}));
process.on('uncaughtException', exitHandler.bind(null, {
    exit: true,
    cleanup: true
}));

const server = Hapi.server({
    address: 'localhost',
    port: 3000
})

//-- Set auth strategy

const jwtAuthScheme = function (server, options) {
    return {
        authenticate: LoginController.authenticate
    };
};

server.auth.scheme('scheme', jwtAuthScheme);
server.auth.strategy('custom', 'scheme');
server.auth.default({
    mode: 'required',
    strategy: 'custom'
});

//-- Set routes

server.route(HomeController.home);
server.route(RegistrationController.createUser)
server.route(RegistrationController.verifyAccount);
server.route(RegistrationController.resendVerificationCode);
server.route(LoginController.login);

const initServer = async () => {
    await initDb();
    await emailService.initEmailService();
    await server.start();

    console.log(`Server running at: ${server.info.uri}`);
}

module.exports = {
    server,
    initServer
}