# Photo to Text
## The Authentication Microservice

### 1. Project Goals

- [x] Use Message Queues 
- [x] Use gRPC

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

### 3. Deployment Steps

Not all steps may be necessary.

1. Run Tests

2. Update version in `.env` file.

3. Make a docker build using the make file command:

```
make docker-build
```

4. Publish docker image to DockerHub.

```
make docker-push
```

5. Copy the new `.env` file to ec2

```
scp -i  path/to/key .env ec2-user@ec2-xx-xx-xxx-xxx.compute-1.amazonaws.com:path/to/file
```

6. If there are change to the `docker-compose.production.yml` file or it does not exist on ec2, copy the file to ec2.

```
scp -i  path/to/key docker-compose.production.yml ec2-user@ec2-xx-xx-xxx-xxx.compute-1.amazonaws.com:path/to/file
```

7. If there are changes to the `Makefile` or it does not exist on ec2, copy the file to ec2

```
scp -i  path/to/key Makefile ec2-user@ec2-xx-xx-xxx-xxx.compute-1.amazonaws.com:path/to/file
```

8. Connect to ec2 instance

```
ssh -i path/to/key ec2-user@ec2-xx-xx-xxx-xxx.compute-1.amazonaws.com:path/to/file
```

9. Ensure that docker is installed (`docker -v`)

```
# Update the installed packages and package cache on your instance.

sudo yum update -y

# Install the most recent Docker Community Edition package.

sudo yum install -y docker

# Start the Docker service.

sudo service docker start

# Add the ec2-user to the docker group so you can execute Docker commands without using sudo.

sudo usermod -a -G docker ec2-user
```

Log out and log back in again to pick up the new docker group permissions. You can accomplish this by closing your current SSH terminal window and reconnecting to your instance in a new one. Your new SSH session will have the appropriate docker group permissions.


10. Ensure that docker-compose is installed (`docker-compose -v`)

```
# Run this command to download a given version of Docker Compose:

sudo curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose


# Apply executable permissions to the binary:

sudo chmod +x /usr/local/bin/docker-compose

```

11. Run docker container using make file

```
make docker-start-prod
```

### 4. Todo

- [x] Encrypt password
- [x] Helpful password error mesaage
- [x] Single db instance
- [x] Close db
- [x] Unit Test for Services & Controllers
- [x] Login
- [x] Logout
- [ ] Localize
- [x] Message Queues
- [x] Setup and connect to production database
- [x] Setup and integrate production email
- [ ] after verification, return no content or return javascript that closes the window.
- [ ] Setting up ec2 instance with rabbitmq.
- [ ] hosting project with ec2 instance.
- [ ] domain name? 
- [ ] Move email service out of sandbox by sending request, submitting limits

### 5. References

- [How to use arguments and parameters in ecmascript](https://www.smashingmagazine.com/2016/07/how-to-use-arguments-and-parameters-in-ecmascript-6/)
- [Implementing remote procedure calls with gRPC and protocol buffers](https://scotch.io/tutorials/implementing-remote-procedure-calls-with-grpc-and-protocol-buffers)
