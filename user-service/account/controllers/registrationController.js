const Joi = require('joi')
const _ = require('lodash')

const userService = require('./../services/userService.js');
const {ErrorResponse, domains, ValidationError, DuplicateAccountError} = require('./../errors');

class RegistrationController{

	static async createUser(req,h){
		const body =  _.pick(req.payload, ['email','password','firstName','lastName']);
		try{
			return await userService.createUser (body);
		}catch(e){
			debugger;
			console.log(e)
			let status = 500;
			let resp;
			if (e instanceof ValidationError) {
				resp = new ErrorResponse(domains.account.registration.validation,undefined,e.fields)
				status = 400;
			}else if(e instanceof DuplicateAccountError){
				resp = new ErrorResponse(domains.account.registration.duplicateAccount)
				status = 400;
			}else{
				resp = new ErrorResponse(domains.account.registration.undocumented, e.message)
				status = 500;
			}

			return h.response(resp)
					.code(status);
		}
	}
}

module.exports = {
	createUser: {
		method: 'POST',
		path: '/users',
		handler: RegistrationController.createUser,
		options:{
			validate:{
				headers: Joi.object({
				    'content-type': Joi.string().valid('application/json').required(),
				}).options({allowUnknown: true})
			}
		}
	}
}