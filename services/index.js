const emailQueuer = require('./emailQueuer.js');
const emailSender = require('./emailSender.js');

module.exports.start = async () => {
	await emailSender.start();
	await emailQueuer.start();
}

module.exports.close = () => {
	emailQueuer.close();
	emailSender.close();
}

module.exports.queueEmail = (mailOptions) => {
	emailQueuer.sendEmail(mailOptions);
}