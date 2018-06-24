const Hapi = require('hapi')

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

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});


const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

init()

