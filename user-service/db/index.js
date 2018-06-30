const mongodb = require('mongodb').MongoClient;

let _db;
let _client;

module.exports = {
    initDb,
    getDb,
    getClient,
    closeDb
};

async function initDb() {
	console.log(`Connecting to mongodb\n`);
    _client = await mongodb.connect(process.env.MONGODB_URI,{ useNewUrlParser: true });
    _db = _client.db(process.env.MONGODB_NAME); 
	console.log(`Connected to mongodb: ${_client.isConnected()}`);
}

function getDb() {
    return _db;
}

function getClient() {
    return _client;
}

function closeDb(){
	if(_client){
		console.log(`Closing client`);
		_client.close();
		console.log(`Connected to mongodb: ${_client.isConnected()}`);
	}
}