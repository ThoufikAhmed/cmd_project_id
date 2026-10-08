const LocationValidationController = require('./locationValidationController.js')
const GetAllFactoryLocationsController = require('./getAllFactoryLocationsController')

const locationRepository = require('../../../models/service/repository/location')

const locationValidationController = new LocationValidationController(locationRepository)
const getAllFactoryLocationsController = new GetAllFactoryLocationsController(locationRepository)

module.exports = {
  locationValidationController,
  getAllFactoryLocationsController
}
