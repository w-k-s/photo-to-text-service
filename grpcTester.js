const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(__dirname+'/account/proto/authentication.proto');
const proto = grpc.loadPackageDefinition(packageDefinition).authentication;
const {logObj} = require('./utils');
const rpcServerAddress = 'localhost:50050';

const test = () => {
	if(process.argv.length <= 2){
		console.log(`- Argument 1 (Required): auth token.\n- Argument 2 (Optional): rpc address e.g. ${rpcServerAddress}`);
		return;
	}

	const token = process.argv[2];
	const address = process.argv.length <= 3? rpcServerAddress : process.argv[3];

	console.log(`Testing gRPC at ${address} with token: ${token}`);

	const client = new proto.ValidateAuthenticationService(address, grpc.credentials.createInsecure());
	client.isAuthTokenValid({token},(err,resp)=>{
		if(err){
			logObj('gRPC Failed',err);
			return;
		}
		logObj('gRPC Succeeded',resp);
	});
}

test();