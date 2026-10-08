/**
 * Express router for service routes related to locations
 * @module routers/v8/service/locations
 */

const express = require('express')
const router = express.Router()

const asyncMiddleware = require('../../../../middleware/async')
const serviceControllers = require('../../../controllers/service')

/**
 * Route for fetching all valid factory locations
 * @name get/service/locations
 * @function
 * @memberof module:routers/v8/service/locations
 * @returns {locationList[]} The list location details {@link module:routers/v8/service/locations~locationList}
 */
/**
 * @inner
 * @typedef {Object} locationList
 * @property {String} locationList.location The location code
 * @property {String} locationList.locationName The location name
 * @property {String} locationList.locationType The location type
 */
router.get('/', asyncMiddleware(async (req, res) => {
  console.log('serviceControllers')
  return serviceControllers.getAllFactoryLocationsController.execute(req, res)
}))

module.exports = router
