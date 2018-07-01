const {initDb,getDb,getClient} = require('./../../db');

const {User, Token} = require('./../models');
const {DuplicateAccountError} = require('./../errors');

const usersCollection = 'users'
const mongoDuplicateKeyErrorCode = 11000;


const saveUser = async (user)=>{
	const res = await insertUser(user);
	await indexUsers();
	console.log(`db user: ${res}`);
	return res;
}

const insertUser = async (user)=>{
	const obj = {...user}
	try{
		const collection = await getDb().collection(usersCollection);
		const res = await collection.insert(obj)
		return res.insertedIds[0]
	}catch(err){
		if(err.name === 'MongoError' && err.code == mongoDuplicateKeyErrorCode){
			throw new DuplicateAccountError(err)
		}
		throw err;
	}
}

const indexUsers = async ()=>{
	const collection = getDb().collection(usersCollection);
	await collection.createIndex( { 'email': 1 }, { unique: true });
}


module.exports = {
	saveUser
};