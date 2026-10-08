const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')

const Location = require('../src/models/service/entities/location')
const Batch = require('../src/models/fabstitch/entities/batch')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')
const faker = require('faker')

chai.use(chaiHttp)

describe('fabstitch/batch/target routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/batch/'

  describe('POST fabstitch/batch/:batchNumber/target', () => {
    it('should return a 200 with a json of true if the batch OC Target details is inserted successfully:', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)

      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = path + `${batchNumber}/target`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location,
          ocNumber,
          productCode,
          productDescription: faker.datatype.string(),
          quantity: faker.datatype.number()
        })
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })
})
