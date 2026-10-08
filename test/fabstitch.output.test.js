const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const faker = require('faker')

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const defectRepository = require('../src/models/fabstitch/repository/defect')
const jobworkOrderRepository = require('../src/models/jobwork/repository/order')

const Batch = require('../src/models/fabstitch/entities/batch')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')
const Location = require('../src/models/service/entities/location')
const BatchStatusEnum = require('../src/models/fabstitch/entities/batchStatusEnum')
const DHUStatusEnum = require('../src/models/fabstitch/entities/DHUStatusEnum')
const orderStatusEnum = require('../src/models/jobwork/entities/orderStatusEnum')
const PartBarcode = require('../src/models/fabcut/entities/partBarcode')
const JobworkOrder = require('../src/models/jobwork/entities/jobworkOrder')

chai.use(chaiHttp)

describe('fabstitch/output routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/output/'

  describe('POST /fabstitch/output/product/qrCode/:qrCode', () => {
    it('should respond with a 200 and return output details', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)
      const qrCode = faker.random.alphaNumeric(10)

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      batchRepository.postBatchResource(batchNumber, location, numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { itemDescription } = new PartBarcode().constructMock()

      const targetQuantity = faker.datatype.number({ min: 10000, max: 99999 })
      await batchRepository.postOCDailyTarget(batchNumber, location, ocNumber, productCode, itemDescription, targetQuantity)

      const jobWorkOrderEntity = new JobworkOrder().constructMock()
      const { style, customerName, productDescription, fitType, machineSam, globalSam, colourCode, colourDescription, size, quantity } = jobWorkOrderEntity

      const colourSizeDetails = [{ colourCode, colourDescription, sizeDetails: [{ size, quantity }] }]
      await jobworkOrderRepository.postJobWorkOrder(ocNumber, location, style, customerName, productCode,
        productDescription, fitType, machineSam, globalSam, colourSizeDetails)

      const DHUStatus = DHUStatusEnum.APPROVED
      const orderType = orderStatusEnum.INHOUSE
      await defectRepository.postDHUDetails(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourDescription, fitType, null, size, quantity, DHUStatus, orderType, [], qrCode)

      const updatedPath = path + `product/qrCode/${qrCode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('isQrCodeRepeated')
      response.body.should.have.property('outputDetailsList')
      response.body.isQrCodeRepeated.should.be.a('boolean')
      response.body.outputDetailsList.should.be.a('array')
      response.body.outputDetailsList.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('batchNumber')
        obj.should.have.property('location')
        obj.should.have.property('ocNumber')
        obj.should.have.property('productCode')
        obj.should.have.property('productDescription')
        obj.should.have.property('colourCode')
        obj.should.have.property('colourDescription')
        obj.should.have.property('orderType')
        obj.should.have.property('fitType')
        obj.should.have.property('totalOutputQuantity')

        obj.batchNumber.should.be.a('string')
        obj.location.should.be.a('string')
        obj.ocNumber.should.be.a('string')
        obj.productCode.should.be.a('string')
        obj.productDescription.should.be.a('string')
        obj.colourCode.should.be.a('string')
        obj.colourDescription.should.be.a('string')
        obj.orderType.should.be.a('string')
        obj.fitType.should.be.a('string')
        obj.totalOutputQuantity.should.be.a('number')
      })
    })
  })

  describe('GET /fabstitch/output/product/location/:location', () => {
    it('should respond with a 200 and return output details', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)
      const qrCode = faker.random.alphaNumeric(10)

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      batchRepository.postBatchResource(batchNumber, location, numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { itemDescription } = new PartBarcode().constructMock()

      const targetQuantity = faker.datatype.number({ min: 10000, max: 99999 })
      await batchRepository.postOCDailyTarget(batchNumber, location, ocNumber, productCode, itemDescription, targetQuantity)

      const jobWorkOrderEntity = new JobworkOrder().constructMock()
      const { style, customerName, productDescription, fitType, machineSam, globalSam, colourCode, colourDescription, size, quantity } = jobWorkOrderEntity

      const colourSizeDetails = [{ colourCode, colourDescription, sizeDetails: [{ size, quantity }] }]
      await jobworkOrderRepository.postJobWorkOrder(ocNumber, location, style, customerName, productCode,
        productDescription, fitType, machineSam, globalSam, colourSizeDetails)

      const DHUStatus = DHUStatusEnum.APPROVED
      const orderType = orderStatusEnum.INHOUSE
      await defectRepository.postDHUDetails(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourDescription, fitType, null, size, quantity, DHUStatus, orderType, [], qrCode)

      const updatedPath = path + `product/location/${location}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('batchNumber')
        obj.should.have.property('location')
        obj.should.have.property('ocNumber')
        obj.should.have.property('productCode')
        obj.should.have.property('productDescription')
        obj.should.have.property('colourCode')
        obj.should.have.property('colourDescription')
        obj.should.have.property('orderType')
        obj.should.have.property('fitType')
        obj.should.have.property('totalOutputQuantity')

        obj.batchNumber.should.be.a('string')
        obj.location.should.be.a('string')
        obj.ocNumber.should.be.a('string')
        obj.productCode.should.be.a('string')
        obj.productDescription.should.be.a('string')
        obj.colourCode.should.be.a('string')
        obj.colourDescription.should.be.a('string')
        obj.orderType.should.be.a('string')
        obj.fitType.should.be.a('string')
        obj.totalOutputQuantity.should.be.a('number')
      })
    })
  })
})
