const distanceCalculator = require('../../../utils/distanceCalculator')
const logger = require('../../../utils/logger')

class LocationValidationController {
  constructor (locationRepository) {
    this.locationRepository = locationRepository
  }

  async execute (req, res) {
    const { latitude, longitude } = req.query
    const { locals: { requestId } } = res
    const requestVersion = req.get('version') || req.get('x-api-version') || 'not-provided'
    logger.info(`${requestId} version: ${requestVersion} ${req.method} ${req.originalUrl}`)
    logger.info(`${requestId} ${req.originalUrl} Fetching all locations`)
    const locations = await this.locationRepository.getAllLocations()
    const possibleLocations = locations.map(({ location, latitude: lat, longitude: lon, radius }) => {
      const distance = distanceCalculator(latitude, longitude, lat, lon)
      if (distance < radius) {
        return location
      }
      return null
    }).filter(record => record)
    if (possibleLocations.length === 0) {
      logger.error(`${requestId} ${req.originalUrl} No possible locations found`)
      return res.status(400).json({ message: 'No possible locations found' })
    }
    logger.info(`${requestId} ${req.originalUrl} Locations successfully returned: ${possibleLocations}`)
    return res.status(200).json(possibleLocations)
  }
}

module.exports = LocationValidationController
