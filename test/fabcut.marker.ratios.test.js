process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') }) //  including this because its required to inject env variables into emailService
require('dotenv').config({ path: path.join(__dirname, '../.test.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')

const expect = chai.expect
const should = chai.should()  //eslint-disable-line
const faker = require('faker')

chai.use(chaiHttp)

const markerRepository = require('../src/models/fabcut/repository/marker')
const locationRepository = require('../src/models/service/repository/location')

const Marker = require('../src/models/fabcut/entities/marker')
const Location = require('../src/models/service/entities/location')

describe('fabcut/marker/ratios routes', () => {
  const host = process.env.TEST_ENDPOINT
  describe('GET /fabcut/marker/ratios/:OC', () => {
    const path = '/fabcut/marker/ratios/'

    it('should respond with a 200 status code and return fetched details from Sage if oc number validation was successful', async () => {
      const { ocNumber } = await markerRepository.getOcNumberForTest()
      const updatedPath = path + `${ocNumber}`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['merchant', 'customer', 'styleNo', 'itemList', 'fitTypeList'])
      response.body.merchant.should.be.a('string')
      response.body.customer.should.be.a('string')
      response.body.styleNo.should.be.a('string')
      response.body.itemList.should.be.a('array')
      response.body.fitTypeList.should.be.a('array')
      response.body.itemList.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('item')
        obj.item.should.be.a('string')
      })
      response.body.fitTypeList.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('fitType')
        obj.fitType.should.be.a('string')
      })
    })
  })

  describe('DELETE /fabcut/marker/ratios/:markerUnique', () => {
    const path = '/fabcut/marker/ratios/'

    it('should respond with a 200 status code with boolean true if marker is deleted successfully', async () => {
      const markerEntity = new Marker().constructMock()
      const { markerId, ocNumber, fitType, location } = markerEntity
      await markerRepository.createTestMarker(ocNumber, markerId, fitType, location)

      const updatedPath = path + `${markerId}`
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await markerRepository.removeMarker(markerId)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })

  describe('POST /fabcut/marker/ratios/:OC', () => {
    const path = '/fabcut/marker/ratios/'

    it('should respond with a 200 status code and boolean true if the marker details are inserted and an automated email is sent successfully', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const markerEntity = new Marker().constructMock()
      const { markerId, ocNumber, fitType } = markerEntity

      const updatedPath = path + `${ocNumber}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          markerUnique: markerId,
          factoryLocation: location,
          fitType,
          custName: faker.random.alphaNumeric(5),
          styleNo: faker.random.alphaNumeric(5),
          shrinkage: faker.random.alphaNumeric(5),
          sheetLink: faker.random.alphaNumeric(5),
          mailComment: faker.random.alphaNumeric(5),
          items: [{ itemNo: faker.random.alphaNumeric(5), itemDesc: faker.random.alphaNumeric(5) }],
          approvedConsumption: faker.datatype.number(),
          sizeRatioDetails: [{
            Size: faker.random.alphaNumeric(2),
            Qty: faker.datatype.number(),
            ratio: [{
              ratio: faker.datatype.number(),
              ratioqty: faker.datatype.number(),
              rationumber: faker.datatype.number(),
              ratiolay: faker.datatype.number()
            }]
          }]
        })

      await locationRepository.deleteLocation(location)
      await markerRepository.removeMarker(markerId)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })
})
