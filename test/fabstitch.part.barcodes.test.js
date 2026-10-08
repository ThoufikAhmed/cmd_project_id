const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line

const partBarcodeRepository = require('../src/models/fabcut/repository/partBarcode')

chai.use(chaiHttp)

describe('fabstitch/partbarcode routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/partbarcode/'

  describe('GET fabstitch/partbarcode/:partbarcode/detail', () => {
    it('should respond with a 200 and an part barcode details', async () => {
      const { barcode } = await partBarcodeRepository.getValidPartBarcodeForTest()

      const updatedPath = path + `${barcode}/detail`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('style')
      response.body.should.have.property('ocNumber')
      response.body.should.have.property('buyerName')
      response.body.should.have.property('cutNumber')
      response.body.should.have.property('fitType')
      response.body.should.have.property('itemCode')
      response.body.should.have.property('itemDescription')
      response.body.should.have.property('size')
      response.body.should.have.property('quantity')
      response.body.should.have.property('location')
      response.body.should.have.property('productCode')
      response.body.should.have.property('productDescription')
      response.body.should.have.property('styleDescription')
      response.body.should.have.property('colourCode')
      response.body.should.have.property('colourDescription')
      response.body.should.have.property('productSeasonCode')
      response.body.should.have.property('productSeasonDescription')
      response.body.should.have.property('productShade')
      response.body.should.have.property('productShrinkage')
      response.body.should.have.property('productPattern')

      response.body.style.should.be.a('string')
      response.body.ocNumber.should.be.a('string')
      response.body.buyerName.should.be.a('string')
      response.body.cutNumber.should.be.a('number')
      response.body.fitType.should.be.a('string')
      response.body.itemCode.should.be.a('string')
      response.body.itemDescription.should.be.a('string')
      response.body.size.should.be.a('string')
      response.body.quantity.should.be.a('number')
      response.body.location.should.be.a('string')
      response.body.productCode.should.be.a('string')
      response.body.productDescription.should.be.a('string')
      response.body.styleDescription.should.be.a('string')
      response.body.colourCode.should.be.a('string')
      response.body.colourDescription.should.be.a('string')
    })
  })
})
