const _ = require('lodash');
const validator = require('validator');
const {MongoError} = require('mongodb');
const passwordTest = require('owasp-password-strength-test');

const {User, Token} = require('./../models');
const {mongoose} = require('./../../db');
const {ValidationError, DuplicateAccountError} = require('./error.js');

const mongoDuplicateKeyErrorCode = 11000;

const TokenSchema = new mongoose.Schema({
	access:{
		type: String,
		required: true,
		enum: ['auth']
	},
	token:{
		type: String,
		required: true
	}
})
const TokenModel = mongoose.model('Token',TokenSchema);

const UserSchema = new mongoose.Schema({
	email:{
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		index: true,
		unique: true,
		lowercase: true,
		validate:{
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
	},
	password:{
		type: String,
		required: true,
		minlength: 6,
		validate:{
			validator: (v)=>{
				return passwordTest.test(v).strong
			},
			message: '{VALUE} is not a strong password. It should include a lowercase, uppercase and a special character'
		}
	},
	firstName:{
		type: String,
		required: true,
		minlength: 1,
		match: /^[A-Z]*[a-z]*/
	},
	lastName:{
		type: String,
		required: true,
		minlength: 1,
		match: /^[A-Z]*[a-z]*/
	},
	isActive:{
		type: Boolean,
		default: false
	},
	isStaff:{
		type: Boolean,
		default: false
	},
	createDate:{
		type: Date,
		default: Date.now
	},
	lastLogin:{
		type: Date,
		default: null
	},
	tokens: [TokenSchema]
})

const UserDao = mongoose.model('User',UserSchema)
UserSchema.statics.save = async (obj) => {
	try{
		const userDao = new UserDao(obj)
		const savedUserDao = await userDao.save()
		return daoToModel(savedUserDao)
	}catch(e){
		if(e.name === "MongoError" && e.code == mongoDuplicateKeyErrorCode){
			throw new DuplicateAccountError(e)
		}else{
			const fields = _.mapValues(e.errors,(value)=>value.message)
			throw new ValidationError(fields,e)
		}
	}
}

UserSchema.statics.update = async(obj) =>{
	console.log(`Update user with id: ${JSON.stringify(obj,undefined,2)}`)
	const updatedUserDao = await UserDao.findOneAndUpdate({_id: obj.id},{$set:obj},{new: true})
	return daoToModel(updatedUserDao)
}

const daoToModel = (dao) => {
	//TODO: Refactor
	return new User(
		id = dao._id.toHexString(), 
		email = dao.email, 
		password = dao.password, 
		firstName = dao.firstName, 
		lastName = dao.lastName,
		isActive = dao.isActive,
		isStaff = dao.isStaff,
		createDate = dao.createDate,
		lastLogin = dao.lastLogin,
		tokens = dao.tokens.map((tokenModel)=>new Token(tokenModel.access, tokenModel.token))
	) 
}

module.exports = {
	save: UserSchema.statics.save,
	update: UserSchema.statics.update
}