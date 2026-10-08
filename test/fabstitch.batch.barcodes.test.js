const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const should = chai.should()  //eslint-disable-line

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const partBarcodeRepository = require('../src/models/fabcut/repository/partBarcode')
const Location = require('../src/models/service/entities/location')
const Batch = require('../src/models/fabstitch/entities/batch')
const BatchStatusEnum = require('../src/models/fabstitch/entities/batchStatusEnum')
const PartBarcode = require('../src/models/fabcut/entities/partBarcode')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')

chai.use(chaiHttp)

describe('fabstitch/batch/barcodes routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/batch/'

  describe('GET fabstitch/batch/:batchNumber/barcodes', () => {
    it('should respond with a 400 bad request if the location is not valid', async () => {
      const batchNumber = faker.random.alphaNumeric(2)
      const location = faker.random.alphaNumeric(6)

      const updatedPath = path + `${batchNumber}/barcodes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location
        })
      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('message')
      response.body.message.should.equal('This location is not valid')
    })

    it('should respond with a 400 bad request if the batch does not exist', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, location, radius, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const batchEntity = new Batch().constructMock()
      batchEntity.location = location
      const { batchNumber } = batchEntity

      const updatedPath = path + `${batchNumber}/barcodes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location: location
        })
      await locationRepository.deleteLocation(location)

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('message')
      response.body.message.should.equal('This batch does not exist')
    })

    it('should respond with a 200 and an empty array for a batch that has no barcodes scanned in it', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      batchEntity.location = location
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = path + `${batchNumber}/barcodes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location: location
        })

      await locationRepository.deleteLocation(location)
      await batchRepository.deleteBatch(batchNumber, location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.should.have.members([])
    })

    it('should respond with a 200 and an array of barcodes scanned into the batch', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.location = location
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const barcodes = new Array(4).fill(0).map(elem => new PartBarcode().constructMock())
      for (let i = 0; i < barcodes.length; i++) {
        const { barcode } = barcodes[i]
        await batchRepository.postBarcodeInBatch(batchNumber, location, barcode)
      }

      const updatedPath = path + `${batchNumber}/barcodes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location
        })

      for (let i = 0; i < barcodes.length; i++) {
        const { barcode } = barcodes[i]
        await batchRepository.deleteBarcodeFromBatch(batchNumber, location, barcode)
      }
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      const expectedResponse = barcodes.map(barcodeEntity => barcodeEntity.barcode)
      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.should.have.members(expectedResponse)
    })
  })

  describe('POST fabstitch/batch/:batchNumber/barcodes/:barcode', () => {
    it('should return a 200 with a json of true if the barcode is inserted successfully', async () => {
      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const partBarcodeEntity = new PartBarcode().constructMock()
      partBarcodeEntity.location = location
      const { barcode, fitType, size, itemCode, itemDescription, lay, quantity, part } = partBarcodeEntity
      const { ocNumber, style, name } = part
      const barcodeData = [{ barcode, location, fitType, size, itemCode, itemDescription, lay, quantity }]
      await partBarcodeRepository.createPartsBarcodes(location, ocNumber, style, name, barcodeData)

      const targetQuantity = faker.datatype.number({ min: 100, max: 999 })
      const productCode = itemCode.slice(0, 8)

      await batchRepository.postOCDailyTarget(batchNumber, location, ocNumber, productCode, itemDescription, targetQuantity)

      const updatedPath = path + `${batchNumber}/barcodes/${barcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location
        })

      await partBarcodeRepository.deletePartsBarcode(barcode)
      await batchRepository.deleteBarcodeFromBatch(batchNumber, location, barcode)
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)
      await partBarcodeRepository.deleteParts(ocNumber, location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.deep.equal(partBarcodeEntity)
    })
  })

  describe('DELETE fabstitch/batch/:batchNumber/barcodes/:barcode', () => {
    it('should return a 200 with a json of true if the barcode is deleted successfully', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.location = location
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const partBarcodeEntity = new PartBarcode().constructMock()
      partBarcodeEntity.location = location
      const { barcode, fitType, size, itemCode, itemDescription, lay, quantity, part } = partBarcodeEntity
      const { ocNumber, style, name } = part
      const barcodeData = [{ barcode, location, fitType, size, itemCode, itemDescription, lay, quantity }]
      await partBarcodeRepository.createPartsBarcodes(location, ocNumber, style, name, barcodeData)

      await batchRepository.postBarcodeInBatch(batchNumber, location, barcode)

      const updatedPath = path + `${batchNumber}/barcodes/${barcode}`
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location
        })

      await partBarcodeRepository.deletePartsBarcode(barcode)
      await batchRepository.deleteBarcodeFromBatch(batchNumber, location, barcode)
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)
      await partBarcodeRepository.deleteParts(ocNumber, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })
})
