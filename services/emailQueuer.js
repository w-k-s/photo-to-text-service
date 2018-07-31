'use strict';
const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const {logObj,prettyJSON} = require('./../utils');

const queue = 'email';

let conn;
let channel;

const start = async () => {
    try{
        conn = await amqp.connect("amqp://localhost:5672");
        channel = await conn.createChannel();
        channel.assertQueue(queue,{durable: false});
    }catch(e){
        console.log(`Error starting publishing queue: ${prettyJSON(e)}`);
    }
}

const sendEmail = async (mailOptions) => {
    mailOptions.from = 'App Email <app@email.com>'
    channel.sendToQueue(queue,Buffer.from(prettyJSON(mailOptions)));
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