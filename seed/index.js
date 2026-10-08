/**
 * The seed script entry point
 * The command line script for help : npm run seed help
 * The command line script to seed data : npm run seed -- --test <process> --lat <latitude> --long <longitude>
 */
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const Joi = require('@hapi/joi')
const logger = require('../src/utils/logger')
const dhuSeedFunction = require('./dhu')

/**
 * Validate passed arguments
 */
const validateArguments = (test, lat, long) => {
  const body = { test, lat, long }

  const schema = {
    test: Joi.string().required(),
    lat: Joi.number().required(),
    long: Joi.number().required()
  }

  const validaion = Joi.validate(body, schema)
  if (validaion.error) {
    const formattedErrorMsg = validaion.error.details[0].message.replace(/[^a-zA-Z0-9. ]/g, '')
    logger.error(`${formattedErrorMsg}`)
    return false
  }
  return true
}

/**
 * Fetch the seed process function based on the process name
 */
const getProcessSeedFunction = (processName) => {
  let processSeedFunction = null
  switch (processName.toLowerCase()) {
    case 'dhu': processSeedFunction = dhuSeedFunction
      break
    default:
      logger.error('Invalid test process name')
      process.exit(1)
  }
  return processSeedFunction
}

/**
 * Seed entry point
 */
const SeedIndex = () => {
  const args = require('minimist')(process.argv.slice(2))
  const { test, lat, long, _: any } = args

  // Show help info
  if (any.includes('help')) {
    const seedSyntax = 'npm run seed -- --test <process-name> --lat <latitude> --long <longitude>'
    const revertSynatx = 'npm run revert-seed'
    console.log('\x1b[33m%s\x1b[0m', ` Seed script: ${seedSyntax}\n Valid process names : DHU\n Revert seed script: ${revertSynatx}\n`)
    return
  }

  // Validate passed arguments
  if (validateArguments(test, lat, long) === false) {
    return
  }

  try {
    const processSeedFunction = getProcessSeedFunction(test)
    logger.info(`Starting seed for : ${test}`)
    processSeedFunction(lat, long).then(seededData => {
      console.log('\x1b[33m%s\x1b[0m', seededData)
      logger.info('Seeded data successfully !')
      process.exit(0)
    })
  } catch (err) {
    logger.error(err)
  }
}

SeedIndex()
