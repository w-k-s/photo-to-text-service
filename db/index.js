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
    console.log(`db:\tConnecting to ${process.env.MONGODB_URI} ${process.env.MONGODB_NAME}`);
    _client = await mongodb.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true
    });
    _db = _client.db(process.env.MONGODB_NAME);
    console.log(`db:\tconnected: ${_client.isConnected()}`);
}

function getDb() {
    return _db;
}

function getClient() {
    return _client;
}

function closeDb() {
    if (_client) {
        _client.close();
        console.log(`db:\tConnected: ${_client.isConnected()}`);
    }
}