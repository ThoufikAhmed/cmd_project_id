const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const should = chai.should()  //eslint-disable-line

const locationRepository = require('../src/models/service/repository/location')
const Location = require('../src/models/service/entities/location')

chai.use(chaiHttp)

describe('service/locations/validate routes', () => {
  const host = process.env.TEST_ENDPOINT

  describe('GET /service/validate/locations', () => {
    const path = '/service/validate/locations'
    it('should return a 400 if there are no possible locations found', (done) => {
      const invalidLatitude = faker.address.latitude(1, 3)
      const invalidLongitude = faker.address.longitude(1, 3)
      chai.request(host)
        .get(path)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          latitude: invalidLatitude,
          longitude: invalidLongitude
        })
        .end((err, res, body) => {
          if (err) {
            done(err)
          }
          res.should.have.status(400)
          res.body.should.have.property('message')
          res.body.message.should.equal('No possible locations found')
          done()
        })
    })

    it('should return a 200 along with an array of locations if valid latitude and longitude is passed in', async () => {
      const { latitude, longitude, location, radius, locationName, locationType } = new Location().constructMock()
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const response = await chai.request(host)
        .get(path)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          latitude: latitude,
          longitude: longitude
        })
      await locationRepository.deleteLocation(location)
      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.should.have.members([location])
    })
  })
})
