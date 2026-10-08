process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const faker = require('faker')
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiAsPromised = require('chai-as-promised')

const should = chai.should()  //eslint-disable-line
chai.use(chaiHttp)
chai.use(chaiAsPromised)

const poRepository = require('../src/models/fabscan/repository/po')
const fabricRepository = require('../src/models/fabscan/repository/fabric')

const Fabric = require('../src/models/fabscan/entities/fabric')
const Location = require('../src/models/service/entities/location')

//  Modules that require testing
// const executeSageMIR = require('../src/controllers/executeSageMir')

describe('fabscan/scan/receipt', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabscan/scan/receipts/'

  describe('/fabscan/scan/receipts/:location', () => {
    it('should return a 200 status code and an empty array if all barcodes already have an MIR number', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const { barcode, ocNumber } = new Fabric().constructMock()
      const { location } = new Location().constructMock()

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

      const updatedPath = path + `${location}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ userName: name, barcodes: [barcode] })

      await poRepository.deletePoDetails(ocNumber)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.length.should.be.equal(0)
    })

    // the below integration test will raise a dummy MIR in Sage
    it('should return a 200 status code and the list of MIR numbers if MIRs were raised successfully', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const { barcode, ocNumber } = new Fabric().constructMock()
      const { location } = new Location().constructMock()

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

      const updatedPath = path + `${location}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ userName: name, barcodes: [barcode] })

      await poRepository.deletePoDetails(ocNumber)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('string')
      })
    })
  })
})
