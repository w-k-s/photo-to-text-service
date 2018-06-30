const _ = require('lodash');

const {ValidationError} = require('./../repository/error.js');

const validateJoiResult = function(result){
	if(result && result.error){
		const fields = _.fromPairs(result.error.details.map((detail)=> [_.join(detail.path,'.'),detail.message] ))
		throw new ValidationError(fields);
	}
}

module.exports = {
	validateJoiResult
}