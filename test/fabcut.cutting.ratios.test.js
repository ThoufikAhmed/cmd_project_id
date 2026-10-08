process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const should = chai.should()  //eslint-disable-line

chai.use(chaiHttp)

const markerRepository = require('../src/models/fabcut/repository/marker')
const locationRepository = require('../src/models/service/repository/location')

const Marker = require('../src/models/fabcut/entities/marker')
const Location = require('../src/models/service/entities/location')

describe('fabcut/cutting/ratios routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabcut/cutting/ratios/'

  describe('GET fabcut/cutting/ratios/:marker', () => {
    it('should respond with a 200 status code with the fetched marker ratio details', async () => {
      const { location } = new Location().constructMock()

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const custName = faker.datatype.string()
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const styleNo = faker.datatype.string()
      const shrinkage = faker.datatype.string()
      const approvedConsumption = faker.datatype.number()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const ratioNumber = faker.datatype.number()
      const ratioQuantity = faker.datatype.number()
      const ratioLay = faker.datatype.number()
      const markerObject = {
        custName,
        styleNo,
        shrinkage,
        fitType,
        markerUnique: markerId,
        factoryLocation: location,
        approvedConsumption,
        items: [{ itemNo: itemCode, itemDesc }],
        sizeRatioDetails: [{
          Size: size,
          Qty: quantity,
          ratio: [{
            ratio,
            rationumber: ratioNumber,
            ratioqty: ratioQuantity,
            ratiolay: ratioLay
          }]
        }]
      }
      await markerRepository.postMarkerDetails(ocNumber, markerObject)

      const updatedPath = path + `${markerId}`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await markerRepository.removeMarker(markerId)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('items')
      response.body.should.have.property('custName')
      response.body.should.have.property('styleNo')
      response.body.should.have.property('sizeQtys')
      response.body.should.have.property('ratios')
      response.body.should.have.property('layLengths')
      response.body.items.should.be.a('array')
      response.body.sizeQtys.should.be.a('array')
      response.body.ratios.should.be.a('array')
      response.body.layLengths.should.be.a('array')
    })
  })

  describe('POST fabcut/cutting/ratios/:fromOC/clone', () => {
    it('should respond with a 200 status with boolean true if the marker details were replicated successfully', async () => {
      const location = faker.random.arrayElement(['IDU7', 'IDU10'])
      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const custName = faker.datatype.string()
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const styleNo = faker.datatype.string()
      const shrinkage = faker.random.alphaNumeric(3)
      const approvedConsumption = faker.datatype.number()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const ratioNumber = faker.datatype.number()
      const ratioQuantity = faker.datatype.number()
      const ratioLay = faker.datatype.number()
      const markerObject = {
        custName,
        styleNo,
        shrinkage,
        fitType,
        markerUnique: markerId,
        factoryLocation: location,
        approvedConsumption,
        items: [{ itemNo: itemCode, itemDesc }],
        sizeRatioDetails: [{
          Size: size,
          Qty: quantity,
          ratio: [{
            ratio,
            rationumber: ratioNumber,
            ratioqty: ratioQuantity,
            ratiolay: ratioLay
          }]
        }]
      }
      const insertId = await markerRepository.postMarkerDetails(ocNumber, markerObject)

      const updatedPath = path + `${ocNumber}/clone`
      const orderQuantity = faker.datatype.number()
      const getTargetOC = await markerRepository.getOcNumberForTest()
      const toOC = getTargetOC.ocNumber

      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ toOC, orderQuantity })

      await markerRepository.removeMarker(markerId)
      await markerRepository.removeMarker(insertId + toOC)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('GET fabcut/cutting/ratios/:ocNo/fitTypes', () => {
    it('should respond with a 200 status request with fetched fit types from the server', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const custName = faker.datatype.string()
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const styleNo = faker.datatype.string()
      const shrinkage = faker.datatype.string()
      const approvedConsumption = faker.datatype.number()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const ratioNumber = faker.datatype.number()
      const ratioQuantity = faker.datatype.number()
      const ratioLay = faker.datatype.number()
      const markerObject = {
        custName,
        styleNo,
        shrinkage,
        fitType,
        markerUnique: markerId,
        factoryLocation: location,
        approvedConsumption,
        items: [{ itemNo: itemCode, itemDesc }],
        sizeRatioDetails: [{
          Size: size,
          Qty: quantity,
          ratio: [{
            ratio,
            rationumber: ratioNumber,
            ratioqty: ratioQuantity,
            ratiolay: ratioLay
          }]
        }]
      }
      await markerRepository.postMarkerDetails(ocNumber, markerObject)

      const updatedPath = path + `${ocNumber}/fitTypes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location: location })

      await markerRepository.removeMarker(markerId)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('string')
      })
    })
  })

  describe('GET fabcut/cutting/ratios/markers/:ocNo', () => {
    it('should respond with a 200 status request with fetched markers and item details from the server', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const custName = faker.datatype.string()
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const styleNo = faker.datatype.string()
      const shrinkage = faker.datatype.string()
      const approvedConsumption = faker.datatype.number()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const ratioNumber = faker.datatype.number()
      const ratioQuantity = faker.datatype.number()
      const ratioLay = faker.datatype.number()
      const markerObject = {
        custName,
        styleNo,
        shrinkage,
        fitType,
        markerUnique: markerId,
        factoryLocation: location,
        approvedConsumption,
        items: [{ itemNo: itemCode, itemDesc }],
        sizeRatioDetails: [{
          Size: size,
          Qty: quantity,
          ratio: [{
            ratio,
            rationumber: ratioNumber,
            ratioqty: ratioQuantity,
            ratiolay: ratioLay
          }]
        }]
      }
      await markerRepository.postMarkerDetails(ocNumber, markerObject)

      const updatedPath = path + `/markers/${ocNumber}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ fitType, location })

      await markerRepository.removeMarker(markerId)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('markerUnique')
        obj.should.have.property('shrinkage')
        obj.should.have.property('items')
        obj.markerUnique.should.be.a('string')
        obj.shrinkage.should.be.a('string')
        obj.items.should.be.a('array')
        obj.items.map(item => {
          item.should.have.property('itemCode')
          item.should.have.property('itemDesc')
          item.itemCode.should.be.a('string')
          item.itemDesc.should.be.a('string')
        })
      })
    })
  })
})
