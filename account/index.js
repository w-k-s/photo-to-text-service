const {userRepository} = require('./repository')

module.exports.setup = async () => {
	await userRepository.createIndexes()
}