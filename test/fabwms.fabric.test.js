const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const faker = require('faker')
const expect = chai.expect

const poRepository = require('../src/models/fabscan/repository/po')
const fabricRepository = require('../src/models/fabwms/repository/fabric')
const rackRepository = require('../src/models/fabwms/repository/rack')

const Fabric = require('../src/models/fabscan/entities/fabric')
const Rack = require('../src/models/fabwms/entities/rack')

chai.use(chaiHttp)

describe('fabwms/fabric routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabwms/fabric'

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

  describe('Post fabwms/fabric/:fabricBarcode', () => {
    it('should return a 200 along with a boolean of true if the fabric barcode is inserted into the db with an entry date', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }
      await poRepository.postPoDetails(poNumber, dataObject)

      const updatedPath = `${path}/${barcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)
      await fabricRepository.deleteFabricBarcode(barcode)

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['poNumber', 'fabricLength', 'itemCode', 'itemDescription'])
      response.body.poNumber.should.be.a('string')
      response.body.fabricLength.should.be.a('number')
      response.body.itemCode.should.be.a('string')
      response.body.itemDescription.should.be.a('string')
    })
  })

  describe('PUT fabwms/fabric/:fabricBarcode', () => {
    it('should return a 200 along with a boolean of true if a fabric not associated with a rack is assigned an exit date', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }
      await poRepository.postPoDetails(poNumber, dataObject)

      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)

      await fabricRepository.createFabricAndEntryDate(barcode)

      const updatedPath = `${path}/${barcode}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)
      await fabricRepository.deleteFabricBarcode(barcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should return a 200 along with a boolean of true if a fabric associated with a rack is assigned an exit date', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }
      await poRepository.postPoDetails(poNumber, dataObject)

      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)

      await fabricRepository.createFabricAndEntryDate(barcode)
      await fabricRepository.associateFabricWithRack(barcode, rackBarcode)
      await fabricRepository.dissociateFabricFromRack(barcode)

      const updatedPath = `${path}/${barcode}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)
      await fabricRepository.deleteFabricBarcode(barcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })
})
