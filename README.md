# Photo to Text
## The Authentication Microservice

### 1. Project Goals

- [x] Use Message Queues 
- [x] Use gRPC
- [ ] Hosting microservice for as little as possible

### 2. Routes

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

### 3. Todo

- [x] Encrypt password
- [x] Helpful password error mesaage
- [x] Single db instance
- [x] Close db
- [x] Unit Test for Services & Controllers
- [x] Login
- [x] Logout
- [ ] Localize
- [x] Message Queues

### 3. References

- [How to use arguments and parameters in ecmascript](https://www.smashingmagazine.com/2016/07/how-to-use-arguments-and-parameters-in-ecmascript-6/)
- [Implementing remote procedure calls with gRPC and protocol buffers](https://scotch.io/tutorials/implementing-remote-procedure-calls-with-grpc-and-protocol-buffers)
