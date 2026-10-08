const BaseEntity = require('../../BaseEntity')
const LocationTypeEnum = require('./locationTypeEnum')
const faker = require('faker')

class Location extends BaseEntity {
  /**
   * @param {String} location The name of the location
   * @param {Number} latitude The location latitude
   * @param {Number} longitude The location longitude
   * @param {Number} radius The radius for the location
   * @param {String} locationName The name for the location
   * @param {LocationTypeEnum} locationType The type of the location
   * @param {String} locationCode The code for the location
   */
  constructor (location, latitude, longitude, radius, locationName, locationType, locationCode, locationSageName) {
    super()
    console.log('locationcons', location)
    this.location = location
    this.latitude = latitude
    this.longitude = longitude
    this.radius = radius
    this.locationName = locationName
    this.locationType = locationType
    this.locationCode = locationCode
    this.locationSageName = locationSageName
  }

  constructMock () {
    const possibleType = Object.values(LocationTypeEnum)
    const statusToPick = faker.datatype.number({ min: 0, max: possibleType.length - 1 })
    const locationType = possibleType[statusToPick]
    return new Location(
      faker.random.alphaNumeric(3),
      faker.address.latitude(),
      faker.address.longitude(),
      faker.datatype.number(),
      faker.random.alphaNumeric(12),
      locationType,
      faker.random.alphaNumeric(12), // Pass a random locationCode
      faker.random.alphaNumeric(12) // Pass a random locationSageName
    )
  }
}

module.exports = Location
