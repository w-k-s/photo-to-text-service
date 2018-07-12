'use strict';
const Joi = require('joi');

const contentTypeJson = Joi.object({
	'content-type': Joi.string().valid('application/json').required(),
}).options({allowUnknown: true})

module.exports = {
	contentTypeJson
}