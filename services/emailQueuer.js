'use strict';
const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const {logObj,prettyJSON} = require('./../utils');

const emailHost = process.env.EMAILSERVICE_HOST;
const emailPort = parseInt(process.env.EMAILSERVICE_PORT);
const emailSecure = process.env.EMAILSERVICE_SECURE === "true";
const emailUser = process.env.EMAILSERVICE_USER;
const emailPassword = process.env.EMAILSERVICE_PASS;

const queue = 'email';

let conn;
let channel;

const start = async () => {
    try{
        conn = await amqp.connect();
        channel = await conn.createChannel();
        channel.assertQueue(queue,{durable: false});
    }catch(e){
        console.log(`Error starting publishing queue: ${prettyJSON(e)}`);
    }
}

const sendEmail = async (mailOptions) => {
    mailOptions.from = 'App Email <app@email.com>'
    channel.sendToQueue(queue,new Buffer(prettyJSON(mailOptions)));
}

const close = async () => {
    try{
        conn.close();
    }catch(e){
        console.log(`Error closing publishing queue: ${prettyJSON(e)}`);
    }
}

module.exports = {
    start,
    close,
    sendEmail
}