const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const faker = require('faker')

const rackRepository = require('../src/models/fabwms/repository/rack')
const poRepository = require('../src/models/fabscan/repository/po')

const Rack = require('../src/models/fabwms/entities/rack')
const Pallet = require('../src/models/fabwms/entities/pallet')
const BarcodeTypeEnum = require('../src/models/fabwms/entities/barcodeTypeEnum')
const Fabric = require('../src/models/fabscan/entities/fabric')

chai.use(chaiHttp)

describe('fabwms/racks routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabwms/'

  describe('GET fabwms/:barcode', () => {
    it('should return a 200 along with a type of rack if the barcode is a rack barcode', async () => {
      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity

      await rackRepository.createRack(rackBarcode)

      const updatedPath = path + `${rackBarcode}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('type')
      response.body.type.should.equal(BarcodeTypeEnum.RACK)
    })

    it('should return a 200 along with a type of fabric if the barcode is a fabric barcode', async () => {
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
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('type')
      response.body.type.should.equal(BarcodeTypeEnum.FABRIC)
    })

    it('should return a 200 along with a type of pallet if the barcode is a pallet barcode', async () => {
      const palletEntity = new Pallet().constructMock()
      const { barcode } = palletEntity

      const updatedPath = path + `${barcode}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('type')
      response.body.type.should.equal(BarcodeTypeEnum.PALLET)
    })
  })
})
