class VerificationController{

	static async verifyToken(request){
		const token = request.params.token
	}

	static async recreateToken(request){

	}
}

module.exports = {
	verifyUser: {
		method: 'GET',
		path: '/users/verify/{token}',
		handler: VerificationController.verifyToken
	},
	reverifyUser: {
		method: 'POST',
		path: '/users/recreateToken',
		handler: VerificationController.recreateToken
	}
}