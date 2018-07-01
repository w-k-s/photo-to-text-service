class ErrorResponse{

	constructor(domain, message = domain.message, userInfo){
		this.code = domain.code;
		this.path = domain.path;
		this.message = message;
		this.userInfo = userInfo;
	}

}

module.exports = ErrorResponse