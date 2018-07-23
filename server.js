require('./config/config.js')
const express = require('express');

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

const app = express();
app.use(express.json());

//-- Set routes

const authenticate = LoginController.authenticate;

app.get('/', HomeController.home);
app.post('/users', RegistrationController.createUser)
app.get('/users/verify/:token', RegistrationController.verifyAccount);
app.post('/users/resendVerificationCode', RegistrationController.resendVerificationCode);
app.post('/users/login', LoginController.login);
app.post('/users/logout', authenticate, LoginController.logout);

//-- Init

const initServer = async () => {
    await initDb();
    await emailService.initEmailService();
    app.listen(process.env.PORT,()=>{
        console.log(`Server running at: ${process.env.PORT}`);
    });
}

//-- Exit

const closeServer = async () => {
    await app.close();
}

function exitHandler() {

    console.log('Cleaning...');
    closeDb();

    console.log('Exiting...');
    process.exit();

}

process.on('SIGINT', exitHandler.bind(null));
process.on('SIGUSR1', exitHandler.bind(null));
process.on('SIGUSR2', exitHandler.bind(null));
process.on('uncaughtException', exitHandler.bind(null));

//-- Exports

module.exports = {
    app,
    initServer,
    closeServer
}