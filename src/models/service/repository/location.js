const db = require('../../../model/db')
const Location = require('../entities/location')
const LocationTypeEnum = require('../entities/locationTypeEnum') // eslint-disable-line

module.exports = {
  /**
   * @name getAllLocations
   * @function
   * @instance
   * @memberof module:repository/location
   * @returns {Location[]}
   */
  getAllLocations: async function () { 
    const query = 'SELECT location, latitude, longitude, radius, location_name as locationName, location_type as locationType, org_code_loc as locationCode , location_sage_name as locationSageName FROM service_locations' 
    const result = await db.mysqlHelpers.runQuery(query) 
    const locationDTO = result.map(({ location, latitude, longitude, radius, locationName, locationType, locationCode, locationSageName }) => {
       const locationEntity = new Location(location, latitude, longitude, radius, locationName, locationType, locationCode, locationSageName) 
       if (locationEntity.isValid() === true) { 
        return locationEntity } }).filter(record => record)
        return locationDTO },// console.log('dekkk bhaiiii ederrrr', locationDTO) return locationDTO },


  /**
   * @name isLocationValid
   * @function
   * @instance
   * @memberof module:repository/location
   * @param {String} location
   * @returns {Location[]}
   */
  isLocationValid: async function (location) {
    const query = 'SELECT EXISTS (SELECT * FROM service_locations WHERE location=?) as isLocationValid'
    const result = await db.mysqlHelpers.runQueryWithParameters(query, location)

    const { isLocationValid } = result[0]
    return !!(isLocationValid)
  },

  /**
   * @name createNewLocation
   * @function
   * @instance
   * @memberof module:repository/location
   * @param {Number} latitude
   * @param {Number} longitude
   * @param {Number} radius
   * @param {String} location
   * @param {String} locationName
   * @param {LocationTypeEnum} locationType
   * @returns {Number}
   */
  createNewLocation: async function (latitude, longitude, radius, location, locationName, locationType) {
    const query = `INSERT INTO service_locations (location, latitude, longitude, radius, location_name, location_type)
      VALUES (?)`
    const parametersToQuery = [location, latitude, longitude, radius, locationName, locationType]
    const result = await db.mysqlHelpers.runQueryWithParameters(query, parametersToQuery)
    const { affectedRows } = result
    return affectedRows
  },

  /**
   * @name deleteLocation
   * @function
   * @instance
   * @memberof module:repository/location
   * @param {String} location
   * @returns {Number}
   */
  deleteLocation: async function (location) {
    const query = 'DELETE FROM service_locations WHERE location=?'
    const parametersToQuery = [location]
    const result = await db.mysqlHelpers.runQueryWithParameters(query, parametersToQuery)
    const { affectedRows } = result
    return affectedRows
  },

  /**
   * @name validateLocation
   * @function
   * @instance
   * @memberof module:repository/location
   * @param {String} location
   * @returns {Location}
   */
  validateLocation: async function (location) {
    const query = 'SELECT * FROM service_locations WHERE location=?'
    const result = await db.mysqlHelpers.runQueryWithParameters(query, location)
    console.log('resuljjt', result)
    const { location: loc, latitude, longitude, radius, location_name: locationName, location_type: locationType, org_code_loc: locationCode, location_sage_name: locationSageName } = result[0] || {}
    return new Location(loc, latitude, longitude, radius, locationName, locationType, locationCode, locationSageName)
  },

  /**
   * This method returns the list of factory locations
   * @name getAllFactoryLocations
   * @function
   * @instance
   * @memberof module:repository/location
   * @returns {Location[]}
   */
  getAllFactoryLocations: async function () {
    const query = `
      SELECT
        sl.location,
        sl.latitude,
        sl.longitude,
        sl.radius,
        sl.location_name AS locationName,
        sl.location_type AS locationType,
        sl.org_code_loc AS locationCode,
        sl.location_sage_name AS locationSageName,
        sb.batch_number AS batchNumber
      FROM service_locations sl
      LEFT JOIN stitching_batches sb
        ON sl.location = sb.location
        AND sb.status = 'active'
      ORDER BY sl.location, sb.batch_number
    `

    const result = await db.mysqlHelpers.runQuery(query)
    const groupedLocations = {}

    result.forEach((row) => {
      const loc = row.location

      if (!groupedLocations[loc]) {
        const locationEntity = new Location(
          row.location,
          row.latitude,
          row.longitude,
          row.radius,
          row.locationName,
          row.locationType,
          row.locationCode,
          row.locationSageName
        )

        if (locationEntity.isValid() === true) {
          groupedLocations[loc] = {
            location: row.location,
            latitude: row.latitude,
            longitude: row.longitude,
            radius: row.radius,
            locationName: row.locationName,
            locationType: row.locationType,
            locationCode: row.locationCode,
            locationSageName: row.locationSageName,
            batches: []
          }
        }
      }

      if (groupedLocations[loc] && row.batchNumber) {
        groupedLocations[loc].batches.push({
          batch_number: row.batchNumber
        })
      }
    })

    return Object.values(groupedLocations)
  }
}
