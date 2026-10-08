const logger = require('../../../utils/logger')

class GetAllFactoryLocationsController {

  constructor(locationRepository) {
    this.locationRepository = locationRepository
  }

  async execute(req, res) {

    const { locals: { requestId } } = res
    const metaLogger = logger.logWithMetaData(requestId, req.originalUrl)

    metaLogger.info('Fetching all valid location from the database')

    const fetchedLocations = await this.locationRepository.getAllFactoryLocations()

    // ✅ Updated mapping (include batches)
    const locationsList = fetchedLocations.map((locationObject) => {

      const {
        location,
        locationName,
        locationType,
        locationCode,
        locationSageName,
        batches = []   // default empty array
      } = locationObject

      return {
        location,
        locationName,
        locationType,
        locationCode,
        locationSageName,
        batches
      }
    })

    if (locationsList.length === 0) {

      metaLogger.error('No locations found')
      return res.status(400).json({ message: 'No locations found' })

    }

    metaLogger.info(`Returning the list of locations: ${JSON.stringify(locationsList)}`)

    return res.status(200).json(locationsList)
  }
}

module.exports = GetAllFactoryLocationsController
