class ValidationError extends Error{
	constructor(fields,message){
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		this.stack = (new Error(message)).stack;
		this.fields = fields;
	}
}

class DuplicateAccountError extends Error{
	constructor(...args){
		super(...args);
		this.name = this.constructor.name;
		this.stack = (new Error()).stack;
	}
}

class WeakPasswordError extends Error{
	constructor(message){
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		this.stack = (new Error(message)).stack;
	}
}

class TokenNotFoundError extends Error{
	constructor(message){
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		this.stack = (new Error(message)).stack;
	}
}

class InvalidTokenError extends Error{
	constructor(...args){
		super(...args);
		this.name = this.constructor.name;
		this.stack = (new Error()).stack;
	}
}

module.exports = {
	ValidationError,
	DuplicateAccountError,
	WeakPasswordError, 
	TokenNotFoundError,
	InvalidTokenError
}