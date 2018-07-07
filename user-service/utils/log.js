module.exports.logObj = (tag, obj) => {
	console.log(`${tag}: ${JSON.stringify(obj,undefined,2)}`);
}

module.exports.logType = (tag,obj) => {
	console.log(`${tag}: ${JSON.stringify((typeof obj),undefined,2)}`);
}