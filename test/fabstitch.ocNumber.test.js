const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line

const batchRepository = require('../src/models/fabstitch/repository/batch')
const outputRepository = require('../src/models/fabstitch/repository/output')

chai.use(chaiHttp)

describe('fabstitch/ocNumber/:ocNumber routes', () => {
  const host = process.env.TEST_ENDPOINT

  describe('GET fabstitch/ocNumber/:ocNumber/products', () => {
    it('should respond with a 200 along with array of product details @sage', async () => {
      const { ocNumber } = await outputRepository.getValidOcNumberForTest()

      const updatedPath = `/fabstitch/ocNumber/${ocNumber}/products`
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
        obj.should.have.property('productCode')
        obj.should.have.property('productDescription')
        obj.should.have.property('orderQuantity')
        obj.should.have.property('styleNumber')
        obj.should.have.property('styleDescription')
        obj.should.have.property('buyerName')

        obj.productCode.should.be.a('string')
        obj.productDescription.should.be.a('string')
        obj.orderQuantity.should.be.a('number')
        obj.styleNumber.should.be.a('string')
        obj.styleDescription.should.be.a('string')
        obj.buyerName.should.be.a('string')
      })
    })
  })

  describe('GET fabstitch/ocNumber/:ocNumber/product/colours', () => {
    it('should respond with a 200 along with array of colour details @sage', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)

      const updatedPath = `/fabstitch/ocNumber/${ocNumber}/product/colours`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          productCode
        })

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('colourCode')
        obj.should.have.property('colourDescription')
        obj.colourCode.should.be.a('string')
        obj.colourDescription.should.be.a('string')
      })
    })
  })
})
