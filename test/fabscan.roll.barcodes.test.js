process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const should = chai.should()  //eslint-disable-line
const faker = require('faker')

chai.use(chaiHttp)

const poRepository = require('../src/models/fabscan/repository/po')

// This method returns a randomly generated list of size : ${length}
function makeRandomArray (length, generatorFn) {
  return Array.from({ length }, generatorFn)
}

describe('fabscan/roll/barcodes routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabscan/roll/barcodes/'

  describe('GET /fabscan/roll/barcodes/:PO/validate', () => {
    it('should respond with a 200 status code and boolean true for a valid PO number @sage', async () => {
      const { poNumber } = await poRepository.getValidPoNumberForTest()
      const updatedPath = path + `${poNumber}/validate`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })

  describe('GET /fabscan/roll/barcodes/:PO/items', () => {
    it('should respond with a 200 status code and the item number details for a valid PO number @sage', async () => {
      const { poNumber } = await poRepository.getValidPoNumberForTest()
      const updatedPath = path + `${poNumber}/items`

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
        obj.should.have.property('ITEMNO')
        obj.should.have.property('ITEMDESC')
        obj.ITEMNO.should.be.a('string')
        obj.ITEMDESC.should.be.a('string')
      })
    })
  })

  describe('GET /fabscan/roll/barcodes/:PO/quantity', () => {
    it('should respond with a 200 status code and the boolean value of true along with the ordered and current quantity for the PO number @sage', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const updatedPath = path + `${poNumber}/quantity`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ ItemNo: itemCode })

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['ordQty', 'currQty'])
      response.body.ordQty.should.be.a('number')
      response.body.currQty.should.be.a('number')
    })
  })

  describe('GET fabscan/roll/barcodes/:PO/details', () => {
    it('should respond with a 200 status and the PO details for a valid PO and item number @sage', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const updatedPath = path + `${poNumber}/details`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ itemNo: itemCode })

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys.length).to.equal(5)
      expect(keys).to.have.members(['ocNumber', 'customer', 'styleNumber', 'styleDescription', 'itemDescription'])
    })
  })

  /**
   * This test suite is probably going to be quite complicated
   */
  describe('POST /fabscan/roll/barcodes/:PO/details', () => {
    it('should respond with a status of 200 and if the PO details are inserted successfully @sage', async () => {
      const { poNumber } = await poRepository.getValidPoNumberForTest()
      const updatedPath = path + `${poNumber}/details`

      const OC = 'ID' + faker.datatype.number({ min: 100000, max: 999999 })
      const custName = faker.random.alphaNumeric(10)
      const styleNo = faker.random.alphaNumeric(5)
      const styleDesc = faker.random.alphaNumeric(10)
      const itemNo = faker.random.alphaNumeric(10)
      const itemDesc = faker.random.alphaNumeric(10)
      const name = faker.random.alphaNumeric(10)
      const invoiceNumber = faker.random.alphaNumeric(10)

      const tableData = makeRandomArray(faker.datatype.number({ min: 1, max: 10 }), () => {
        return {
          roll: faker.random.alphaNumeric(10),
          length: faker.datatype.number({ min: 1, max: 100 }),
          supplierRollNo: `${faker.datatype.number({ min: 1, max: 10 })}`,
          fabricWidth: faker.datatype.number({ min: 1, max: 9 }),
          cuttableWidth: faker.datatype.number({ min: 1, max: 8 })
        }
      })

      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          OC,
          custName,
          styleNo,
          styleDesc,
          itemNo,
          itemDesc,
          tableData,
          name,
          invoiceNumber
        })

      await poRepository.deletePoDetails(OC)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
    /**
     * Need to think of more ways to test this specific route because its a critical path
     */
  })

  describe('GET fabscan/roll/barcodes/:PO/generated/details', () => {
    it('should respond with a 200 status and the PO and generated barcode details for a valid PO and item code', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const updatedPath = path + `${poNumber}/generated/details`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ itemNo: itemCode })

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys.length).to.equal(6)
      expect(keys).to.have.members(['ocNumber', 'customer', 'styleNumber', 'styleDescription', 'itemDescription', 'rollDetails'])
      response.body.ocNumber.should.be.a('string')
      response.body.customer.should.be.a('string')
      response.body.styleNumber.should.be.a('string')
      response.body.styleDescription.should.be.a('string')
      response.body.itemDescription.should.be.a('string')
      response.body.rollDetails.should.be.a('array')
    })
  })
})
