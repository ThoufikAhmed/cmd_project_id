process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.test.env') })

const faker = require('faker')
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiAsPromised = require('chai-as-promised')

const should = chai.should()  //eslint-disable-line
chai.use(chaiHttp)
chai.use(chaiAsPromised)

const poRepository = require('../src/models/fabscan/repository/po')
const fabricRepository = require('../src/models/fabscan/repository/fabric')
const locationRepository = require('../src/models/service/repository/location')

const Fabric = require('../src/models/fabscan/entities/fabric')
const Location = require('../src/models/service/entities/location')

describe('fabscan/scan/rolls routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabscan/scan/rolls/'

  describe('POST /fabscan/scan/rolls/:barcode', () => {
    /**
     * Figure out test - should return a 200 status code and barcode details for a valid barcode if scanning it will be within the allowed MIR limit @sage'
     */

    it('should return a 200 status code and the barcode details for a barcode that has already been scanned/ has an associated MIR number@sage', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const orderQuantity = faker.datatype.number({ min: 1 })
      const receivedQuantity = faker.datatype.number({ min: 1, max: orderQuantity })
      const scannedQuantity = orderQuantity - receivedQuantity
      const { barcode, ocNumber } = new Fabric().constructMock()

      const custName = faker.random.alphaNumeric(10)
      const styleNo = faker.random.alphaNumeric(5)
      const styleDesc = faker.random.alphaNumeric(10)
      const itemDesc = faker.random.alphaNumeric(10)
      const name = faker.random.alphaNumeric(10)
      const rollLength = faker.datatype.number({ min: 1, max: 100 })
      const tableData = [
        {
          roll: barcode,
          length: rollLength,
          supplierRollNo: `${faker.datatype.number({ min: 1, max: 10 })}`
        }
      ]
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }

      await poRepository.postPoDetails(poNumber, dataObject)

      const mirNumber = faker.datatype.number({ min: 1 })
      await fabricRepository.updateBarcodesWithMirNumber(barcode, mirNumber)

      const updatedPath = path + `${barcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location,
          poAndItemWithQuantities: {
            [poNumber]: {
              [itemCode]: scannedQuantity
            }
          }
        })

      await locationRepository.deleteLocation(location)
      await fabricRepository.removeBarcodeFromLocation(barcode, location)
      await poRepository.deletePoDetails(ocNumber)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('rollLength')
      response.body.rollLength.should.be.a('number')
      response.body.rollLength.should.equal(rollLength)
      response.body.should.have.property('poNumber')
      response.body.poNumber.should.be.a('string')
      response.body.poNumber.should.equal(poNumber)
      response.body.should.have.property('itemCode')
      response.body.itemCode.should.be.a('string')
      response.body.itemCode.should.equal(itemCode)
    })
  })

  describe('GET /fabscan/scan/rolls/:barcode', () => {
    it('should return a 200 status code and barcode details for a valid barcode ', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const { barcode, ocNumber } = new Fabric().constructMock()

      const custName = faker.random.alphaNumeric(10)
      const styleNo = faker.random.alphaNumeric(5)
      const styleDesc = faker.random.alphaNumeric(10)
      const itemDesc = faker.random.alphaNumeric(10)
      const name = faker.random.alphaNumeric(10)
      const rollLength = faker.datatype.number({ min: 1, max: 100 })
      const tableData = [
        {
          roll: barcode,
          length: rollLength,
          supplierRollNo: `${faker.datatype.number({ min: 1, max: 10 })}`
        }
      ]
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }

      await poRepository.postPoDetails(poNumber, dataObject)

      const updatedPath = path + `${barcode}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('CUSTNAME')
        obj.should.have.property('STYLENO')
        obj.should.have.property('STYLDESC')
        obj.should.have.property('LEFTOVER')
        obj.CUSTNAME.should.be.a('string')
        obj.STYLENO.should.be.a('string')
        obj.STYLDESC.should.be.a('string')
        obj.LEFTOVER.should.be.a('number')
        obj.CUSTNAME.should.be.equal(custName)
        obj.STYLENO.should.be.equal(styleNo)
        obj.STYLDESC.should.be.equal(styleDesc)
        obj.LEFTOVER.should.be.equal(rollLength)
      })
    })
  })
})
