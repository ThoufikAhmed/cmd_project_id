const chai = require('chai')
const sinon = require('sinon')
const faker = require('faker')
const should = chai.should()  //  eslint-disable-line
const { expect } = require('chai')

const { mockRequest, mockResponse } = require('../../../utils/testUtils')
const locationRepository = require('../../../models/service/repository/location')

const GetAllFactoryLocationsController = require('./getAllFactoryLocationsController')
const Location = require('../../../models/service/entities/location')

describe('GetAllFactoryLocationsController v8.0 unit tests', () => {
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

  it('should return a 400 if no valid factory locations are found', async () => {
    sinon
      .stub(locationRepository, 'getAllFactoryLocations')
      .resolves([])

    const getAllFactoryLocationsController = new GetAllFactoryLocationsController(locationRepository)
    const response = await getAllFactoryLocationsController.execute(req, res)
    expect(response.status.calledWith(400)).to.equal(true)
    expect(response.json.calledWith({ message: 'No locations found' })).to.equal(true)
  })

  it('should return a 200 along with the list of valid factory locations', async () => {
    const locations = new Array(4).fill(0).map((value, index) => {
      return new Location().constructMock()
    })

    const responseList = locations.map((locationObject) => {
      const { location, locationName, locationType, locationCode, locationSageName } = locationObject
      return { location, locationName, locationType, locationCode, locationSageName }
    })

    sinon
      .stub(locationRepository, 'getAllFactoryLocations')
      .resolves(locations)

    const getAllFactoryLocationsController = new GetAllFactoryLocationsController(locationRepository)
    const response = await getAllFactoryLocationsController.execute(req, res)

    expect(response.status.calledWith(200)).to.equal(true)
    expect(response.json.calledWith(responseList)).to.equal(true)
  })
})
