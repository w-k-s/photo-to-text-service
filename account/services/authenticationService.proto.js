const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(__dirname+'/../proto/authentication.proto');
const proto = grpc.loadPackageDefinition(packageDefinition).authentication;

const userService = require('./userService.js');

let server;

const rpcServerAddress = process.env.RPC_SERVER_AUTH_ADDRESS;

const isAuthTokenValid = (call,callback) => {
	const token = call.request.token;

	userService.authenticate(token)
	.then((user)=>{
		console.log(JSON.stringify(user,undefined,2));
		callback(null,{
			id: user._id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			isActive: user.isActive,
			isStaff: user.isStaff,
			createDate: user.createDate,
			lastLogin: user.lastLogin
		});
	})
	.catch((error)=>{
		callback(error);
	})
}

const start = () => {
	server = new grpc.Server();
	server.addService(
		proto.ValidateAuthenticationService.service,
		{isAuthTokenValid}
	);
	server.bind(rpcServerAddress, grpc.ServerCredentials.createInsecure());
	server.start();
	console.log('grpc:\tserver running on port:', rpcServerAddress);
}

const getServer = () => {
	return server;
}

module.exports = {
	start,
	getServer
}