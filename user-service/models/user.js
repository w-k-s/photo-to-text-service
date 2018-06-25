const mongoose = require('mongoose')
const validator = require('validator')
const passwordTest = require('owasp-password-strength-test')

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
	}.
	createDate:{
		type: Date,
		default: Date.now
	}.
	lastLogin:{
		type: Date,
		default: undefined
	},
	isStaff:{
		type: Boolean,
		default: false
	},
	tokens:[
		type: [TokenSchema],
		default: [],
		required: true
	]
})