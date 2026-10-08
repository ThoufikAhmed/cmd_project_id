const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const expect = chai.expect

const bomProductRepository = require('../src/models/bom/repository/product')

chai.use(chaiHttp)

describe('bom routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/bom/'

  describe('Get /bom/ocNumber/:ocNumber/product', () => {
    it('should return a 200 with a json of true if the product list is returned', async () => {
      const ocList = await bomProductRepository.getValidOcDetailsFromBomForTest()
      const { ocNumber, location } = ocList[0]

      const updatedPath = path + `ocNumber/${ocNumber}/product`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location })

      response.should.have.status(200)
      response.body.map(dataObject => {
        dataObject.should.be.a('object')
        const keys = Object.keys(dataObject)
        expect(keys).to.have.members(['productCode', 'productDescripton'])
        dataObject.productCode.should.be.a('string')
        dataObject.productDescripton.should.be.a('string')
      })
    })
  })

  describe('GET /bom/ocNumber/:ocNumber/product/:product/podetails', () => {
    it('should return a 200 with a json of true if the product list is returned', async () => {
      const ocList = await bomProductRepository.getValidOcDetailsFromBomForTest()
      const { ocNumber, location, productCode } = ocList[0]

      const updatedPath = path + `ocNumber/${ocNumber}/product/${productCode}/podetails`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location })

      response.should.have.status(200)
      response.body.map(dataObject => {
        dataObject.should.be.a('object')
        const keys = Object.keys(dataObject)
        expect(keys).to.have.members(['poNumber', 'country', 'colour'])
        dataObject.poNumber.should.be.a('string')
        dataObject.country.should.be.a('string')
        dataObject.colour.should.be.a('string')
      })
    })
  })
})
