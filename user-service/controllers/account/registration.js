class RegistrationController{

	static async createUser(request){

	}
}

module.exports = {
	createUser: {
		method: 'POST',
		path: '/users',
		handler: RegistrationController.createUser
	}
}