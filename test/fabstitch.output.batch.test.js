const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const faker = require('faker')

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const defectRepository = require('../src/models/fabstitch/repository/defect')

const Batch = require('../src/models/fabstitch/entities/batch')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')
const Location = require('../src/models/service/entities/location')
const BatchStatusEnum = require('../src/models/fabstitch/entities/batchStatusEnum')
const DHUStatusEnum = require('../src/models/fabstitch/entities/DHUStatusEnum')
const orderStatusEnum = require('../src/models/jobwork/entities/orderStatusEnum')

chai.use(chaiHttp)

describe('fabstitch/output/batch routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/output/batch/'

  describe('GET fabstitch/output/batch/:batchNumber/ocNumber', () => {
    it('should return a 200 with a list of OC numbers from DHU process', async () => {
      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { ocNumber, productCode, productDescription, colourCode, colourDescription, fitType, size } = await defectRepository.getValidDHUDetailsForTest()
      const DHUStatus = DHUStatusEnum.APPROVED
      const orderType = orderStatusEnum.INHOUSE
      const quantity = faker.datatype.number({ min: 1, max: 10 })
      await defectRepository.postDHUDetails(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourDescription, fitType, null, size, quantity, DHUStatus, orderType, [])

      const updatedPath = path + `${batchNumber}/ocNumber`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(item => {
        item.should.be.a('string')
      })
    })
  })

  describe('GET fabstitch/output/batch/:batchNumber/products', () => {
    it('should return a 200 with a list of products from DHU process', async () => {
      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { ocNumber, productCode, productDescription, colourCode, colourDescription, fitType, size } = await defectRepository.getValidDHUDetailsForTest()
      const DHUStatus = DHUStatusEnum.APPROVED
      const orderType = orderStatusEnum.INHOUSE
      const quantity = faker.datatype.number({ min: 1, max: 10 })
      await defectRepository.postDHUDetails(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourDescription, fitType, null, size, quantity, DHUStatus, orderType, [])

      const updatedPath = path + `${batchNumber}/products`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location,
          ocNumber
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('productCode')
        obj.should.have.property('productDescription')
        obj.productCode.should.be.a('string')
        obj.productDescription.should.be.a('string')
      })
    })
  })

  describe('GET fabstitch/output/batch/:batchNumber/colours', () => {
    it('should return a 200 with a list of colours from DHU process', async () => {
      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { ocNumber, productCode, productDescription, colourCode, colourDescription, fitType, size } = await defectRepository.getValidDHUDetailsForTest()
      const DHUStatus = DHUStatusEnum.APPROVED
      const orderType = orderStatusEnum.INHOUSE
      const quantity = faker.datatype.number({ min: 1, max: 10 })
      await defectRepository.postDHUDetails(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourDescription, fitType, null, size, quantity, DHUStatus, orderType, [])

      const updatedPath = path + `${batchNumber}/colours`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location,
          ocNumber,
          productCode
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('colourCode')
        obj.should.have.property('colourDescription')
        obj.colourCode.should.be.a('string')
        obj.colourDescription.should.be.a('string')
      })
    })
  })
})
