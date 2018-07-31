const amqp = require('amqplib');
const {prettyJSON} = require('./../utils')

let conn;
let channel;

const queue = "email";

module.exports.start = async () => {
	try{
        conn = await amqp.connect();
        channel = await conn.createChannel();
        channel.assertQueue(queue,{durable: false});
        beginProcessing(channel);
    }catch(e){
        console.log(`Error starting subscribing queue: ${prettyJSON(e)}`);
    }
}

const beginProcessing = (channel)=>{
	console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
	try{
		channel.consume(queue, function(msg) {
			console.log(" [x] Received %s", msg.content.toString());
		}, {noAck: true});
	}catch(e){
		console.log(`Error processing queue: ${prettyJSON(e)}`);
	}
}


module.exports.close = () => {
	try{
        conn.close();
    }catch(e){
        console.log(`Error closing subscribing queue: ${prettyJSON(e)}`);
    }
}