const chai = require('chai')
const sinon = require('sinon')
const faker = require('faker')
const should = chai.should()  //  eslint-disable-line
const { expect } = require('chai')

const { mockRequest, mockResponse } = require('../../../utils/testUtils')
const locationRepository = require('../../../models/service/repository/location')

const LocationValidationController = require('./locationValidationController')
const LocationTypeEnum = require('../../../models/service/entities/locationTypeEnum')

describe('LocationValidationController unit tests', () => {
  let req = null
  let res = null
  beforeEach(() => {
    req = mockRequest(
      null,
      null,
      {
        latitude: faker.address.latitude(90, 90),
        longitude: faker.address.longitude(90, 90)
      }
    )
    res = mockResponse()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should return a 400 if no possible locations are found', async () => {
    const fakeLocations = new Array(4).fill(0).map(() => {
      return {
        location: faker.datatype.string(),
        latitude: faker.address.latitude(0, -90),
        longitude: faker.address.longitude(0, -90),
        radius: faker.datatype.number(500),
        locationName: faker.random.alphaNumeric(12),
        locationType: LocationTypeEnum.PRODUCTION
      }
    })
    sinon
      .stub(locationRepository, 'getAllLocations')
      .resolves(fakeLocations)
    const locationValidationController = new LocationValidationController(locationRepository)
    const response = await locationValidationController.execute(req, res)
    expect(response.status.calledWith(400)).to.equal(true)
    expect(response.json.calledWith({ message: 'No possible locations found' })).to.equal(true)
  })

  it('should return a 200 along with the list of possible locations', async () => {
    const locations = new Array(4).fill(0).map((value, index) => {
      if (index < 2) {
        return {
          location: faker.datatype.string(),
          latitude: faker.address.latitude(0, -90),
          longitude: faker.address.longitude(0, -90),
          radius: faker.datatype.number(500),
          locationName: faker.random.alphaNumeric(12),
          locationType: LocationTypeEnum.PRODUCTION
        }
      }
      return {
        location: faker.datatype.string(),
        latitude: faker.address.latitude(90, 90, 1),
        longitude: faker.address.longitude(90, 90, 1),
        radius: faker.datatype.number(500),
        locationName: faker.random.alphaNumeric(12),
        locationType: LocationTypeEnum.PRODUCTION
      }
    })
    sinon
      .stub(locationRepository, 'getAllLocations')
      .resolves(locations)
    const locationValidationController = new LocationValidationController(locationRepository)
    const response = await locationValidationController.execute(req, res)
    expect(response.status.calledWith(200)).to.equal(true)
  })
})
