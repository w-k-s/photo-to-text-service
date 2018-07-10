class BaseError extends Error{
	constructor(message){
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		this.stack = (new Error(message)).stack;
	}
}

class ValidationError extends BaseError{
	constructor(fields,message){
		super(message);
		this.fields = fields;
	}
}

class DuplicateAccountError extends BaseError{}

class WeakPasswordError extends ValidationError{
	constructor(fields,message){
		super(fields,message);
	}
}

class TokenNotFoundError extends BaseError{}

class InvalidTokenError extends BaseError{}

class AccountNotFoundError extends BaseError{}

module.exports = {
	ValidationError,
	DuplicateAccountError,
	WeakPasswordError, 
	TokenNotFoundError,
	InvalidTokenError,
	AccountNotFoundError
}