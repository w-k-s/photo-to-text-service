class ValidationError extends Error{
	constructor(fields, ...args){
		super(...args)
		this.fields = fields
	}
}

class DuplicateAccountError extends Error{
	constructor(...args){
		super(...args)
	}
}

module.exports = {
	ValidationError,
	DuplicateAccountError
}