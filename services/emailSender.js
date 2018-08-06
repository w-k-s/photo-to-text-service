'use strict';
const nodemailer = require('nodemailer');
const amqp = require('amqplib');

const {prettyJSON} = require('./../utils')

const emailHost = process.env.EMAILSERVICE_HOST;
const emailPort = parseInt(process.env.EMAILSERVICE_PORT);
const emailSecure = process.env.EMAILSERVICE_SECURE === "true";
const emailUser = process.env.EMAILSERVICE_USER;
const emailPassword = process.env.EMAILSERVICE_PASS;
const queue = process.env.EMAIL_QUEUE_NAME;

let conn;
let channel;
let transport;

module.exports.start = async () => {
	await setupTransport();

    console.log(`emailSender:\tConnecting to mq '${process.env.MESSAGE_QUEUE_ADDRESS}'`);
    conn = await amqp.connect(process.env.MESSAGE_QUEUE_ADDRESS);
    channel = await conn.createChannel();
    channel.assertQueue(queue,{durable: false});
    beginProcessing(channel);
}

const setupTransport = async () => {
    console.log(`emailSender:\tSetting up transport`);
    const account = {
        user: emailUser,
        pass: emailPassword
    }
    if (process.env.NODE_ENV !== "production") {
        let testAccount = await nodemailer.createTestAccount();
        account.user = testAccount.user;
        account.pass = testAccount.pass;
    }
    transport = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailSecure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
    console.log(`emailSender:\ttransport setup complete`);
}

const beginProcessing = (channel)=>{
	console.log(`emailSender:\tWaiting for messages in queue: '${queue}'`);
	try{
		channel.consume(queue, async function(msg) {
            const content = msg.content.toString();
            console.log(`\n\n\n${prettyJSON(content)}\n\n\n`);
			const mailOptions = JSON.parse(content);
            await sendEmail(mailOptions);
		}, {noAck: true});
	}catch(e){
		console.log(`emailSender:\tError processing queue: ${prettyJSON(e)}`);
	}
}

const sendEmail = async (mailOptions) => {
    mailOptions.from = 'App Email <app@email.com>'
    const info = await transport.sendMail(mailOptions)
    if (process.env.NODE_ENV !== "production") {
        console.log(`emailSender:\tpreview: ${nodemailer.getTestMessageUrl(info)}`)
    }
    return info;
}

module.exports.close = () => {
	try{
        conn.close();
        console.log(`emailSender:\tExited`);
    }catch(e){
        console.log(`emailSender:\tError closing subscribing queue: ${prettyJSON(e)}`);
    }
}