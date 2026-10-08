const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line

const locationRepository = require('../src/models/service/repository/location')
const Location = require('../src/models/service/entities/location')

chai.use(chaiHttp)

describe('service/locations/ routes', () => {
  const host = process.env.TEST_ENDPOINT

  describe('GET /service/locations', () => {
    const path = '/service/locations'

    it('should return a 200 along with an array of valid locations', async () => {
      const { latitude, longitude, location, radius, locationName, locationType } = new Location().constructMock()
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const response = await chai.request(host)
        .get(path)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await locationRepository.deleteLocation(location)
      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('location')
        obj.should.have.property('locationName')
        obj.should.have.property('locationType')

        obj.location.should.be.a('string')
        obj.locationName.should.be.a('string')
        obj.locationType.should.be.a('string')
      })
    })
  })
})
