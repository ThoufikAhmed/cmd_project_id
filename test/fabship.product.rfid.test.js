process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const nanoid = require('nanoid')

const faker = require('faker')
const should = chai.should()  //eslint-disable-line
const expect = chai.expect

chai.use(chaiHttp)

const locationRepository = require('../src/models/service/repository/location')
const rfidRepository = require('../src/models/fabship/repository/rfid')
const epcDecoder = require('../src/utils/epcDecoder')
const Location = require('../src/models/service/entities/location')
const RfidCartonBarcodeEntity = require('../src/models/fabship/entities/rfidCartonBarcode')
const Carton = require('../src/models/fabship/entities/carton')

describe('fabship/product/rfid routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabship/product/rfid'

  describe('POST fabship/product/rfid', () => {
    it('should respond with a 200 ok but update the UPDATE_TIME column if the epc codes are already present in the database', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { shipmentId, cartonBarcode, cartonCode, cartonWeight, packType } = new Carton().constructMock()
      const randomEPC = faker.random.alphaNumeric(24)
      const epcArray = [randomEPC]
      epcArray.push(nanoid(24))

      await rfidRepository.insertEPCData(epcArray, location, shipmentId, cartonBarcode, cartonCode, cartonWeight, packType)

      const response = await chai.request(host)
        .post(path)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ location, epcs: epcArray, shipmentId, cartonWeight, cartonBarcode, cartonCode, packType })

      await locationRepository.deleteLocation(location)
      await rfidRepository.deleteEPCData(epcArray, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should respond with a 200 ok request if the epc codes are sent along with a valid location', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { shipmentId, cartonBarcode, cartonCode, cartonWeight, packType } = new Carton().constructMock()
      const epcArray = new Array(3).fill(0).map(elem => nanoid(24))

      const response = await chai.request(host)
        .post(path)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ location, epcs: epcArray, shipmentId, cartonWeight, cartonBarcode, cartonCode, packType })

      await locationRepository.deleteLocation(location)
      await rfidRepository.deleteEPCData(epcArray, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('POST fabship/product/rfid/upload-details', () => {
    it('should return a 200 status with boolean true if the product details are uploaded succesfully', async () => {
      const orderNumber = `${faker.datatype.number({ min: 100000, max: 999999 })}`
      const season = `${faker.datatype.number({ min: 100000, max: 999999 })}`
      const product = `${faker.datatype.number({ min: 1000000, max: 9999999 })}`
      const variant = `${faker.datatype.number({ min: 100000000000000, max: 999999999999999 })}`
      const gtin = `${faker.datatype.number({ min: 10000000000000, max: 99999999999999 })}`
      const articleNumber = `${faker.datatype.number({ min: 100, max: 999 })}`
      const sdsCode = `${faker.datatype.number({ min: 100, max: 999 })}`
      const description = `${faker.random.alphaNumeric(5)}, ${faker.random.alphaNumeric(2)}`
      const productDetails = [{ orderNumber, season, product, variant, gtin, articleNumber, sdsCode, description }]

      const updatedPath = path + '/upload-details'
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ productDetails })

      await rfidRepository.deleteProductDetails(gtin, orderNumber)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('GET /fabship/product/rfid', () => {
    it('should return a 200 status code and the product details for a valid list of EPC(s)', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const validEPC = `303ACA478${faker.random.alphaNumeric(15)}`
      const correspondingGTIN = epcDecoder.convertEPCToGTIN(validEPC)

      const orderNumber = `${faker.datatype.number({ min: 100000, max: 999999 })}`
      const season = `${faker.datatype.number({ min: 100000, max: 999999 })}`
      const product = `${faker.datatype.number({ min: 1000000, max: 9999999 })}`
      const variant = `${faker.datatype.number({ min: 100000000000000, max: 999999999999999 })}`
      const articleNumber = `${faker.datatype.number({ min: 100, max: 999 })}`
      const sdsCode = `${faker.datatype.number({ min: 100, max: 999 })}`
      const description = faker.random.alphaNumeric(5)
      const size = faker.random.alphaNumeric(2)
      const productDetails = [{
        orderNumber,
        season,
        product,
        variant,
        gtin: correspondingGTIN,
        articleNumber,
        sdsCode,
        garmentDescription: description,
        size
      }]

      await rfidRepository.insertProductDetails(productDetails)

      const response = await chai.request(host)
        .get(path)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ epc: [validEPC] })

      await locationRepository.deleteLocation(location)
      await rfidRepository.deleteProductDetails(correspondingGTIN, orderNumber)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('epc')
        obj.should.have.property('size')
        obj.should.have.property('description')
        obj.epc.should.be.a('string')
        obj.size.should.be.a('string')
        obj.description.should.be.a('string')
      })
    })
  })

  describe('GET /fabship/product/rfid/carton/barcode/:barcode', () => {
    it('should return a 200 status code along with carton code based on carton barcode', async () => {
      const { cartonBarcode, cartonDescription, cartonCode } = new RfidCartonBarcodeEntity().constructMock()
      await rfidRepository.insertCartonBarcode(cartonBarcode, cartonDescription, cartonCode)

      const updatedPath = path + `/carton/barcode/${cartonBarcode}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await rfidRepository.deleteCartonBarcode(cartonBarcode)

      response.should.have.status(200)
      response.body.should.be.a('string')
      expect(response.body).to.equal(cartonCode)
    })
  })

  describe('DELETE /fabship/product/rfid/carton', () => {
    it('should return a 200 status code along with true boolean response', async () => {
      const { shipmentId, cartonBarcode, cartonCode, cartonWeight, packType } = new Carton().constructMock()
      const { location } = new Location().constructMock()
      const randomEPC = faker.random.alphaNumeric(24)
      const epcArray = [randomEPC]
      await rfidRepository.insertEPCData(epcArray, location, shipmentId, cartonBarcode, cartonCode, cartonWeight, packType)

      const cartonId = await rfidRepository.getCartonIdFromEPC(randomEPC)

      const updatedPath = path + '/carton'
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ cartonId })

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })

  describe('GET /fabship/product/rfid/location/:location', () => {
    it('should return a 200 status code with the scanned carton details', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const scanDate = new Date().toISOString().slice(0, 10)

      const { shipmentId, cartonBarcode, cartonCode, cartonWeight, packType } = new Carton().constructMock()
      const randomEPC = faker.random.alphaNumeric(24)
      const epcArray = [randomEPC]
      await rfidRepository.insertEPCData(epcArray, location, shipmentId, cartonBarcode, cartonCode, cartonWeight, packType)

      const updatedPath = path + `/location/${location}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ fromScanDate: scanDate, toScanDate: scanDate })

      await locationRepository.deleteLocation(location)
      await rfidRepository.deleteEPCData(epcArray, location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('epcs')
        obj.should.have.property('shipmentId')
        obj.should.have.property('cartonId')
        obj.should.have.property('cartonNumber')
        obj.should.have.property('cartonWeight')
        obj.should.have.property('cartonCode')
        obj.should.have.property('packType')
        obj.should.have.property('scannedDate')
        obj.should.have.property('scannedTime')

        obj.epcs.should.be.a('array')
        obj.shipmentId.should.be.a('string')
        obj.cartonCode.should.be.a('string')
        obj.cartonWeight.should.be.a('number')
        obj.cartonNumber.should.be.a('number')
        obj.packType.should.be.a('string')
        obj.scannedDate.should.be.a('string')
        obj.scannedTime.should.be.a('string')

        expect(obj.epcs).to.deep.equal(epcArray)
        obj.shipmentId.should.be.equal(shipmentId)
        obj.cartonWeight.should.be.equal(cartonWeight)
        obj.cartonCode.should.be.equal(cartonCode)
        obj.cartonNumber.should.be.equal(1)
        obj.packType.should.be.equal(packType)
      })
    })
  })
})
