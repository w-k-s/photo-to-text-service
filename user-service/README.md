1. Routes

POST /users
[-] create temp users given email, password, first name, last name, 
[-] email must be unique (http 400, domain account, code 1102)
[-] sends confirmation email
[-] verification code is jwt which expires in one week
- if email is valid, create user with first name, last name, email, password, isActive, createDate, lastLogin, isStaff, permissions, groups

GET /users/verify/:token
[-] checks if verification token has expired (http 400. domain: "account", code: 1200, "Verification code has expired")
[-] Activate user account

POST /users/resendVerificationCode
[-] Resends verification code

POST users/login
- returns jwt token given email, password

DELETE /users/me/token
- logs out user

GET /users/me (authenticated)
- returns user


2. Error Codes (v1)
  
10000. - Account
11000. -- Registration
11010. --- Account Registration validation error
11020. --- Account with email already exists
11999. --- Undocumented Registration error
12000. -- Verification
12010. --- Verification code has expired
12999. --- Undocumented Verification error
13000. -- Login
13010. --- Invalid username password
13020. --- account with email does not exist
13030. --- account with email has not been verified
13040. --- account with email is blocked
13999. --- Undocumented Login error

3. Todo

[-] Encrypt password
[-] Helpful password error mesaage
[-] Single db instance
[-] Close db
[-] Unit Test Services
- Unit test controllers
- Login 
- Logout
- Localize

4. References

[How to use arguments and parameters in ecmascript](https://www.smashingmagazine.com/2016/07/how-to-use-arguments-and-parameters-in-ecmascript-6/)
