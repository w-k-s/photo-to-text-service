require('./config/config.js')
require('./db/')
const Hapi = require('hapi')
const RegistrationController = require('./account/controllers/registrationController.js')

const server = Hapi.server({
	address: 'localhost',
	port: 3000
})

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'Hello, world!';
    }
});

server.route(RegistrationController.createUser)

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});


const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

init()

