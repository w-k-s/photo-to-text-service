class User{

	constructor(id, email, password, firstName, lastName, isActive = false, isStaff = false, createDate = Date.now(), lastLogin, tokens = new Array()){
		this.id = id;
		this.email = email;
		this.password = password;
		this.firstName = firstName;
		this.lastName = lastName;
		this.isActive = isActive;
		this.isStaff = isStaff;
		this.createDate = createDate;
		this.lastLogin = lastLogin;
		this.tokens = tokens
	}
}

module.exports = User