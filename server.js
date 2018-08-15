require('./config/config.js')
const path = require('path');
const express = require('express');
const account = require('./account');

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

const {emailService} = require('./services');
const authenticationRPCService = require('./account/services').authenticationService;

let server;
const app = express();

app.use(express.json());
app.use('/docs',express.static(path.join(__dirname, 'public')));
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
    await emailService.start();
    authenticationRPCService.start();
    await account.setup();
    
    server = require('http').createServer(app);
    app.listen(process.env.PORT,()=>{
        console.log(`app:\tServer running at: ${process.env.PORT}`);
    });
}

//-- Exit

const closeServer = async () => {
    closeDb();
    emailService.close();
    await server.close();
}

//-- Exports

module.exports = {
    app,
    initServer,
    closeServer
}