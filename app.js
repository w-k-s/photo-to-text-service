const {
    initServer,
    closeServer
} = require('./server.js');

const init = async () => {
    await initServer();
}

function exitHandler(err) {

    if(err){
        console.log(`app:\tShutting down with error: ${err}`);
    }

    console.log('app:\tExiting...:');
    closeServer();

    console.log('app:\tExited');
    process.exit();

}

process.on('SIGINT', exitHandler.bind(null));
process.on('SIGUSR1', exitHandler.bind(null));
process.on('SIGUSR2', exitHandler.bind(null));
process.on('uncaughtException', exitHandler.bind(null));

init();