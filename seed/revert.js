const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const fs = require('fs')
const logger = require('../src/utils/logger')

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const partsRepository = require('../src/models/fabcut/repository/partBarcode')
const markerRepository = require('../src/models/fabcut/repository/marker')
const leaderRepository = require('../src/models/fabcut/repository/leader')
const defectRepository = require('../src/models/fabstitch/repository/defect')
const fileHostingProvider = require('../src/utils/fileHostingProvider')

const RevertSeedFunction = async () => {
  logger.info('Reverting the seeded data')
  var seededData = null
  try {
    seededData = JSON.parse(fs.readFileSync('seed.json'))
  } catch (err) {
    logger.error(err.message)
    process.exit(1)
  }
  console.log('\x1b[33m%s\x1b[0m', seededData)
  const { location, batchNumber, ocNumber, leaderDeviceId, markerId, techPackPathAndFileName } = seededData

  // Location
  await locationRepository.deleteLocation(location)
  // Batch
  await batchRepository.deleteBatch(batchNumber, location)
  // Cutting leader
  await leaderRepository.deleteLeader(leaderDeviceId, location)
  // Cutting marker
  await markerRepository.removeMarker(markerId)
  // Parts
  await partsRepository.deleteParts(ocNumber, location)
  // Defect
  await defectRepository.deleteDefectOcProduct(ocNumber, location)
  // S3 tech pack
  await fileHostingProvider.deleteTechPackFromProvider(techPackPathAndFileName)

  fs.unlinkSync('seed.json')
  logger.info('The seeded data has been reverted')
  process.exit()
}

RevertSeedFunction()
