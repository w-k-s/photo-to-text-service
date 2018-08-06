const env = process.env.NODE_ENV || "local"
const envConfig = require(`./config.${env}.json`)

console.log(`config:\tConfiguring ${env} environment`);
Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]
    console.log(`env:\t'${key}' = '${process.env[key]}'`)
})