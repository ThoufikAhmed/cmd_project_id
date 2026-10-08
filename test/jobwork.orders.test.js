process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const should = chai.should()  //eslint-disable-line

chai.use(chaiHttp)

const Location = require('../src/models/service/entities/location')
const JobworkOrder = require('../src/models/jobwork/entities/jobworkOrder')

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const jobworkOrderRepository = require('../src/models/jobwork/repository/order')

describe('jobwork/order routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/jobwork/order/'

  describe('POST jobwork/order/ocNumber/:ocNumber', () => {
    it('should respond with a 200 status code if job work order inserted successfully', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const jobWorkOrderEntity = new JobworkOrder().constructMock()
      const {
        style, customerName, productDescription, fitType,
        machineSam, globalSam, colourCode, colourDescription, size, quantity
      } = jobWorkOrderEntity

      const jobWorkObject = {
        location,
        style,
        customerName,
        productCode,
        productDescription,
        fitType,
        machineSam,
        globalSam,
        colourSizeDetails: [
          {
            colourCode,
            colourDescription,
            sizeDetails: [
              {
                size, quantity
              }
            ]
          }
        ]
      }

      const updatedPath = `${path}ocNumber/${ocNumber}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send(jobWorkObject)

      await jobworkOrderRepository.deleteJobWorkOrder(ocNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })

  describe('GET jobwork/order/ocNumber/:ocNumber', () => {
    it('should respond with a 200 status code with jobwork order detail', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      const jobWorkOrderEntity = new JobworkOrder().constructMock()
      const {
        style, customerName, productDescription, fitType,
        machineSam, globalSam, colourCode, colourDescription, size, quantity
      } = jobWorkOrderEntity

      const colourSizeDetails = [{ colourCode, colourDescription, sizeDetails: [{ size, quantity }] }]
      await jobworkOrderRepository.postJobWorkOrder(ocNumber, location, style, customerName, productCode,
        productDescription, fitType, machineSam, globalSam, colourSizeDetails)

      const updatedPath = `${path}ocNumber/${ocNumber}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location, productCode, fitType })

      await jobworkOrderRepository.deleteJobWorkOrder(ocNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['ocNumber', 'location', 'style', 'customerName', 'productCode', 'productDescription', 'fitType', 'machineSam', 'globalSam', 'colourSizeDetails'])
      response.body.ocNumber.should.be.a('string')
      expect(response.body.ocNumber).to.equal(ocNumber)
      response.body.location.should.be.a('string')
      expect(response.body.location).to.equal(location)
      response.body.style.should.be.a('string')
      expect(response.body.style).to.equal(style)
      response.body.customerName.should.be.a('string')
      expect(response.body.customerName).to.equal(customerName)
      response.body.productCode.should.be.a('string')
      expect(response.body.productCode).to.equal(productCode)
      response.body.productDescription.should.be.a('string')
      expect(response.body.productDescription).to.equal(productDescription)
      response.body.fitType.should.be.a('string')
      expect(response.body.fitType).to.equal(fitType)
      response.body.machineSam.should.be.a('number')
      expect(response.body.machineSam).to.equal(machineSam)
      response.body.globalSam.should.be.a('number')
      expect(response.body.globalSam).to.equal(globalSam)

      response.body.colourSizeDetails.should.be.a('array')
      response.body.colourSizeDetails.forEach(colourSizeDetailsObject => {
        const keys = Object.keys(colourSizeDetailsObject)
        expect(keys).to.have.members(['colourCode', 'colourDescription', 'sizeDetails'])
        colourSizeDetailsObject.colourCode.should.be.a('string')
        colourSizeDetailsObject.colourDescription.should.be.a('string')
        colourSizeDetailsObject.sizeDetails.should.be.a('array')

        colourSizeDetailsObject.sizeDetails.forEach(sizeDetailsObject => {
          const keys = Object.keys(sizeDetailsObject)
          expect(keys).to.have.members(['size', 'quantity'])
          sizeDetailsObject.size.should.be.a('string')
          sizeDetailsObject.quantity.should.be.a('number')
        })
      })
    })
  })
})
