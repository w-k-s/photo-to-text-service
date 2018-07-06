'use strict';
const nodemailer = require('nodemailer');
const emailHost = process.env.EMAILSERVICE_HOST;
const emailPort = parseInt(process.env.EMAILSERVICE_PORT);
const emailSecure = process.env.EMAILSERVICE_SECURE === "true";
const emailUser = process.env.EMAILSERVICE_USER;
const emailPassword = process.env.EMAILSERVICE_PASS;

let transport;

const initEmailService = async () => {
	console.log(`Initializing Email Service`);
	const account = {
		user: emailUser,
		pass: emailPassword
	}
	if(process.env.NODE_ENV !== "production"){
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
	console.log(`Initialized Email Service`);
}

const sendEmail = async (mailOptions) => {
	mailOptions.from = 'App Email <app@email.com>'
	const info = await transport.sendMail(mailOptions)
	if(process.env.NODE_ENV !== "production"){
		console.log(`email link: ${nodemailer.getTestMessageUrl(info)}`)
	}
	return info ;
}

module.exports = {
	initEmailService,
	sendEmail
}