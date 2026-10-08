const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const faker = require('faker')
chai.use(chaiHttp)

const batchRepository = require('../src/models/fabstitch/repository/batch')
const locationRepository = require('../src/models/service/repository/location')
const defectRepository = require('../src/models/fabstitch/repository/defect')

const BatchResource = require('../src/models/fabstitch/entities/batchResource')
const Location = require('../src/models/service/entities/location')
const ProductDetails = require('../src/models/fabstitch/entities/productDetails')
const Batch = require('../src/models/fabstitch/entities/batch')

const fileHostingProvider = require('../src/utils/fileHostingProvider')

describe('fabstitch/defect routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/defect/'

  describe('GET fabstitch/defect/categories', () => {
    it('should respond with a 200 along with list of categories details', async () => {
      const updatedPath = `${path}categories`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('category')
        obj.should.have.property('defectType')
        obj.category.should.be.a('string')
        obj.defectType.should.be.a('array')
        obj.defectType.map(defectObject => {
          defectObject.should.be.a('string')
        })
      })
    })
  })

  describe('POST fabstitch/defect/product/:productCode/techPack', () => {
    it('should return a 200 with a json of true if s3 bucket file upload and the product techPack path inserted successfully', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { productDescription } = new ProductDetails().constructMock()
      const productTechPack = faker.datatype.string()
      const techPackPath = `masterTechPack/${location}/${ocNumber}/${productCode}.txt`.toUpperCase()

      const updatedPath = `${path}/product/${productCode}/techPack`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ ocNumber, location, productDescription, productTechPack })

      await fileHostingProvider.deleteTechPackFromProvider(techPackPath)
      await defectRepository.deleteDefectOcProduct(ocNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })

  describe('POST fabstitch/defect/product/qrCode/:qrCode', () => {
    it('should return a 200 with a json of true if product label Qr code inserted successfully', async () => {
      const validProductLabelBarcodeObject = await defectRepository.getValidProductQrForTest()
      const { qrCode } = validProductLabelBarcodeObject

      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const qrCodeDetailResults = await defectRepository.validateProductLabelQrCode(qrCode)
      const { ocNumber, productCode, productDescription } = qrCodeDetailResults[0]

      await batchRepository.postBatchResource(batchNumber, location, numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime)
      await batchRepository.postOCDailyTarget(batchNumber, location, ocNumber, productCode, productDescription, faker.datatype.number({ min: 10, max: 50 }))

      const updatedPath = `${path}product/qrCode/${qrCode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location,
          batchNumber,
          status: 'Approved',
          quantity: faker.datatype.number({ min: 10, max: 50 }),
          techPack: null,
          categoryDetails: []
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('topDefect')
      response.body.should.have.property('isQrCodeRepeated')
      response.body.should.have.property('passedDHUDetails')
      response.body.should.have.property('reworkDHUDetails')
      response.body.should.have.property('reworkDHUDetails')
      response.body.topDefect.should.be.a('string')
      response.body.isQrCodeRepeated.should.be.a('boolean')
      response.body.passedDHUDetails.should.be.a('array')
      response.body.passedDHUDetails.should.be.a('array')
      response.body.passedDHUDetails.should.be.a('array')
    })
  })

  describe('GET fabstitch/defect/detail/location/:location', () => {
    it('should return a 200 with a json of top defcet details', async () => {
      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = `${path}detail/location/${location}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          batchNumber
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('topDefect')
      response.body.should.have.property('passedDHUDetails')
      response.body.should.have.property('reworkDHUDetails')
      response.body.should.have.property('reworkDHUDetails')
      response.body.topDefect.should.be.a('string')
      response.body.passedDHUDetails.should.be.a('array')
      response.body.passedDHUDetails.should.be.a('array')
      response.body.passedDHUDetails.should.be.a('array')
    })
  })

  describe('GET fabstitch/defect/location/:location/batchNumber/:batchNumber', () => {
    it('should return a 200 with a json of DHU defect details', async () => {
      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = `${path}location/${location}/batchNumber/${batchNumber}`
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
    })
  })
})
