const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const faker = require('faker')
const expect = chai.expect

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const bomProductRepository = require('../src/models/bom/repository/product')

const Location = require('../src/models/service/entities/location')

chai.use(chaiHttp)

describe('bom/product routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/bom/product/'

  describe('POST /bom/product/ocNumber/:ocNumber', () => {
    it('should return a 200 with a json of true if the bom details is inserted successfully:', async () => {
      const merchandiserName = faker.random.alphaNumeric(10)
      const customerName = faker.datatype.string()
      const style = faker.datatype.string()
      const productDescription = faker.datatype.string()
      const deliveryDate = '2023-01-05'
      const shipType = faker.datatype.string()
      const remark = faker.datatype.string()
      const poNumber = faker.random.alphaNumeric(8)
      const shipTo = faker.datatype.string()
      const colourCode = faker.random.alphaNumeric(3)
      const PackType = faker.random.alphaNumeric(8)
      const extraPercentage = faker.datatype.number({ min: 1, max: 9 })
      const exfactoryDate = '2023-01-05'
      const bomRemark = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number({ min: 1, max: 9 })

      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const updatedPath = path + `ocNumber/${ocNumber}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location,
          merchandiserName,
          customerName,
          style,
          productCode,
          productDescription,
          deliveryDate,
          shipType,
          remark,
          poDetails: [{
            poNumber,
            shipTo,
            colourCode,
            PackType,
            extraPercentage,
            exfactoryDate,
            bomRemark,
            bomSizeDetails: [{
              size,
              quantity,
              linkedBarcode: faker.random.alphaNumeric(8)
            }]

          }]
        })

      await locationRepository.deleteLocation(location)
      await bomProductRepository.deleteBom(ocNumber, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })

  /** Note: valid label barcode should not be empty, only reason to fail test is empty label barcode */
  describe('GET /bom/product/label/labelBarcode/details', () => {
    it('should return a 200 with a json data of label barcode details:', async () => {
      const { ocNumber, productCode, poNumber, shipTo: country, colourCode, labelBarcode, location } = await bomProductRepository.getValidLabelBarcodeDetailsForTest()

      const updatedPath = path + '/label/labelBarcode/details'
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ ocNumber, productCode, poNumber, country, colourCode, labelBarcode, location })

      response.should.have.status(200)
      response.body.map(dataObject => {
        dataObject.should.be.a('object')
        const keys = Object.keys(dataObject)
        expect(keys).to.have.members(['ocNumber', 'location', 'merchandiserName', 'customerName',
          'style', 'productCode', 'productDescription', 'shipType', 'remarks', 'deliveryDate', 'poNumber', 'shipTo',
          'colourCode', 'packType', 'extraPercentage', 'poRemarks', 'exfactoryDate', 'size', 'quantity', 'labelBarcode', 'scannedQuantity', 'orderQuantity'])
        dataObject.ocNumber.should.be.a('string')
        dataObject.location.should.be.a('string')
        dataObject.merchandiserName.should.be.a('string')
        dataObject.customerName.should.be.a('string')
        dataObject.style.should.be.a('string')
        dataObject.productCode.should.be.a('string')
        dataObject.productDescription.should.be.a('string')
        dataObject.shipType.should.be.a('string')
        dataObject.deliveryDate.should.be.a('string')
        dataObject.poNumber.should.be.a('string')
        dataObject.shipTo.should.be.a('string')
        dataObject.colourCode.should.be.a('string')
        dataObject.packType.should.be.a('string')
        dataObject.extraPercentage.should.be.a('number')
        dataObject.exfactoryDate.should.be.a('string')
        dataObject.size.should.be.a('string')
        dataObject.quantity.should.be.a('number')
        dataObject.labelBarcode.should.be.a('string')
        dataObject.scannedQuantity.should.be.a('number')
        dataObject.orderQuantity.should.be.a('number')
      })
    })
  })

  describe('POST /bom/product/labelBarcode/location/:location', () => {
    it('should return a 200 with a json of true if label scanned barcode inserted successfully:', async () => {
      const { ocNumber, productCode, poNumber, shipTo: country, colourCode, labelBarcode, location } = await bomProductRepository.getValidLabelBarcodeDetailsForTest()
      const quantity = faker.datatype.number({ min: 1, max: 10 })

      const updatedPath = path + `/labelBarcode/location/${location}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          labelBarcodeList: [{ ocNumber, productCode, poNumber, country, colourCode, barcode: labelBarcode, quantity }]
        })

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })
})
