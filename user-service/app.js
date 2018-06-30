require('./config/config.js')
const {initDb, getDb, getClient, closeDb} = require('./db/');
const Hapi = require('hapi');

const server = Hapi.server({
	address: 'localhost',
	port: 3000
})

function exitHandler(options, err) {
    if (err){
        console.log(err.stack);
    }
    if (options.cleanup){
        console.log('Cleaning');
        console.log('-  Closing db');
        closeDb();
    }
    if (options.exit){
        console.log('Exiting');
        process.exit();
    }
}

process.on('SIGINT', exitHandler.bind(null,{exit:true,cleanup:true}));
process.on('SIGUSR1', exitHandler.bind(null,{exit:true,cleanup:true}));
process.on('SIGUSR2', exitHandler.bind(null,{exit:true,cleanup:true}));
process.on('uncaughtException', exitHandler.bind(null,{exit:true,cleanup:true}));


server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'Hello, world!';
    }
});

const init = async () => {
    await initDb();
    await server.start();
    
    const RegistrationController = require('./account/controllers/registrationController.js');
    
    server.route(RegistrationController.createUser)
    
    console.log(`Server running at: ${server.info.uri}`);
}

init()
