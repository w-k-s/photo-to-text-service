require('./config/config.js')
const Hapi = require('hapi');

const {initDb, getDb, getClient, closeDb} = require('./db/');
const RegistrationController = require('./account/controllers/registrationController.js');
    
const server = Hapi.server({
	address: 'localhost',
	port: 3000
})

function exitHandler(options, err) {
    if (err){
        console.log(err.stack);
    }
    if (options.cleanup){
        console.log('Cleaning...');
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

server.route(RegistrationController.createUser)

const init = async () => {
    await initDb();
    await server.start();
    
    console.log(`Server running at: ${server.info.uri}`);
}

init()
