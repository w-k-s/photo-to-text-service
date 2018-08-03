const env = process.env.NODE_ENV || "development"
const envConfig = require(`./config.${env}.json`)

Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]
    console.log(`env:\t'${key}' = '${process.env[key]}'`)
})