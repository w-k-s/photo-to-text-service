'use strict';
const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const {logObj,prettyJSON} = require('./../utils');
const ChannelClosedError = require('./error.js');

const queue = process.env.EMAIL_QUEUE_NAME;

let conn;
let channel;

const start = async () => {
    console.log(`emailQueuer:\tConnecting to mq '${process.env.MESSAGE_QUEUE_ADDRESS}'`);
    conn = await amqp.connect(process.env.MESSAGE_QUEUE_ADDRESS);
    channel = await conn.createChannel();
    channel.assertQueue(queue,{durable: false});
}

const sendEmail = async (mailOptions) => {
    try{
        mailOptions.from = 'App Email <app@email.com>'
        await channel.sendToQueue(queue,Buffer.from(prettyJSON(mailOptions)),{mandatory: true});
    }catch(e){
        throw new ChannelClosedError(e);
    }
}

const close = async () => {
    try{
        conn.close();
        console.log(`emailQueuer:\tExited`);
    }catch(e){
        console.log(`emailQueuer:\tError closing queue: ${prettyJSON(e)}`);
    }
}

module.exports = {
    start,
    close,
    sendEmail
}