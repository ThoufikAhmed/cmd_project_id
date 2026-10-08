const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const expect = chai.expect

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const outputRepository = require('../src/models/fabstitch/repository/output')

const Location = require('../src/models/service/entities/location')
const Batch = require('../src/models/fabstitch/entities/batch')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')
const faker = require('faker')

chai.use(chaiHttp)

describe('fabstitch/product/label/batchNumber/:batchNumber routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/product/'

  describe('POST fabstitch/product/label/batchNumber/:batchNumber', () => {
    it('should return a 200 with a json of true if the product label barcode is inserted successfully:', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)

      const { partsBarcode } = await batchRepository.getBundlebarcodeForTest()

      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = path + `label/batchNumber/${batchNumber}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          ocNumber,
          location,
          buyerName: faker.random.alphaNumeric(7),
          style: faker.random.alphaNumeric(7),
          styleDescription: faker.datatype.string(),
          productCode,
          productDescription: faker.datatype.string(),
          fitType: faker.random.alphaNumeric(5),
          colourCode: faker.random.alphaNumeric(3),
          colourDescription: faker.datatype.string(),
          size: faker.random.alphaNumeric(2),
          cutNumber: faker.datatype.number({ min: 1, max: 10 }),
          quantity: faker.datatype.number(),
          buyerPoNumber: faker.random.alphaNumeric(10),
          bundleBarcode: partsBarcode,
          barcodes: [{ barcode: faker.random.alphaNumeric(10), serialNumber: faker.datatype.number({ min: 1, max: 10 }) }]
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)
      await batchRepository.deleteProductLabelDetail(ocNumber, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })

  describe('GET /fabstitch/product/label/:ocNumber/buyerPo', () => {
    it('should respond with a 200 status code on fetch of buyer po from @sage', async () => {
      const { ocNumber } = await outputRepository.getValidOcNumberForTest()
      const updatedPath = path + `label/${ocNumber}/buyerPo`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(item => {
        item.should.be.a('string')
      })
    })
  })

  describe('GET fabstitch/product/bundle/:bundleBarcode', () => {
    it('should return a 200 with a json of true if the product label barcode is inserted successfully:', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)

      const { partsBarcode } = await batchRepository.getBundlebarcodeForTest()

      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const buyerName = faker.random.alphaNumeric(7)
      const style = faker.random.alphaNumeric(7)
      const styleDescription = faker.datatype.string()
      const productDescription = faker.datatype.string()
      const fitType = faker.random.alphaNumeric(5)
      const colourCode = faker.random.alphaNumeric(3)
      const colourDescription = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const cutNumber = faker.datatype.number({ min: 1, max: 10 })
      const quantity = faker.datatype.number()
      const buyerPoNumber = faker.random.alphaNumeric(10)
      const bundleBarcode = partsBarcode
      const barcodes = [{ barcode: faker.random.alphaNumeric(10), serialNumber: faker.datatype.number({ min: 1, max: 10 }) }]

      await batchRepository.postProductLabelDetail(batchNumber, ocNumber, location, buyerName, style, styleDescription, productCode,
        productDescription, fitType, colourCode, colourDescription, size, cutNumber, quantity, buyerPoNumber, barcodes, bundleBarcode)

      const updatedPath = path + `bundle/${bundleBarcode}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)
      await batchRepository.deleteProductLabelDetail(ocNumber, location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        const keys = Object.keys(obj)
        expect(keys).to.have.members(['productSeasonCode', 'productSeasonDescription', 'ocNumber', 'location', 'customerName', 'style', 'styleDescription', 'productCode', 'productDescription', 'fitType', 'colourCode', 'colourDescription', 'size', 'batchNumber', 'cutNumber', 'buyerPoNumber', 'productShade', 'productShrinkage', 'productPattern', 'qrDetails'])
        obj.ocNumber.should.be.a('string')
        obj.location.should.be.a('string')
        obj.customerName.should.be.a('string')
        obj.style.should.be.a('string')
        obj.styleDescription.should.be.a('string')
        obj.productCode.should.be.a('string')
        obj.productDescription.should.be.a('string')
        obj.fitType.should.be.a('string')
        obj.colourCode.should.be.a('string')
        obj.colourDescription.should.be.a('string')
        obj.size.should.be.a('string')
        obj.batchNumber.should.be.a('string')
        obj.cutNumber.should.be.a('number')
        obj.buyerPoNumber.should.be.a('string')
        obj.qrDetails.should.be.a('array')
        obj.qrDetails.forEach(item => {
          const keys = Object.keys(item)
          expect(keys).to.have.members(['qrCode', 'serialNumber'])
          item.qrCode.should.be.a('string')
          item.serialNumber.should.be.a('number')
        })
      })
    })
  })
})
