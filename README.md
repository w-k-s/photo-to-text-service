This project was supposed to be a mono repository but 

### 1. Routes

##### POST /users

- [x] Create temp users given email, password, first name, last name, 
- [x] Email must be unique (http 400, domain account, code 1102)
- [x] Sends confirmation email
- [x] Verification code is jwt which expires in one week
- [x] If email is valid, create user with first name, last name, email, password, isActive, createDate, lastLogin, isStaff, permissions, groups

##### GET /users/verify/:token

- [x] checks if verification token has expired (http 400. domain: "account", code: 1200, "Verification code has expired")
- [x] Activate user account

##### POST /users/reverify

- [x] Resends verification code

##### POST users/login

- [x] returns jwt token given email, password

##### DELETE /users/logout

- [x] logs out user

##### GET /users/me (authenticated)

- [ ] returns user

### 2. Todo

- [x] Encrypt password
- [x] Helpful password error mesaage
- [x] Single db instance
- [x] Close db
- [x] Unit Test for Services & Controllers
- [x] Login
- [x] Logout
- [ ] Localize
- [ ] Message Queues

### 3. References

- [How to use arguments and parameters in ecmascript](https://www.smashingmagazine.com/2016/07/how-to-use-arguments-and-parameters-in-ecmascript-6/)
