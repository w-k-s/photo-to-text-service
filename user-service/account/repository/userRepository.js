//TODO: Refactor
const {MongoClient, MongoError} = require('mongodb');

const {User, Token} = require('./../models');
const {DuplicateAccountError} = require('./error.js');

const usersCollection = 'users'
const mongoDuplicateKeyErrorCode = 11000;

class UserRepository{

	constructor(){
		this.db = null;
		MongoClient.connect(process.env.MONGODB_URI, (err, client) => {
            if (err) console.error(error)
            else console.log("Connected successfully to server");
            this.db = client.db(process.env.MONGODB_NAME);
        });
	}

	async saveUser(user){
		const res = await this.insertUser(user);
		await this.indexUsers();
		console.log(`db user: ${res}`);
		return res;
	}

	async insertUser(user){
		const obj = {...user}
		try{
			const collection = await this.db.collection(usersCollection);
			const res = await collection.insert(obj)
			return res.insertedIds[0]
		}catch(err){
			if(err.name === 'MongoError' && err.code == mongoDuplicateKeyErrorCode){
				throw new DuplicateAccountError(err)
			}
			throw err;
		}
	}

	async indexUsers(){
		const collection = this.db.collection(usersCollection);
		await collection.createIndex( { 'email': 1 }, { unique: true });
	}
}

module.exports = new UserRepository();