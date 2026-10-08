process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')

const should = chai.should()  //eslint-disable-line

chai.use(chaiHttp)

const orderRepository = require('../src/models/fabcut/repository/orders')
const locationRepository = require('../src/models/service/repository/location')

const Location = require('../src/models/service/entities/location')

describe('fabcut/cutting/orders routes', () => {
  const host = process.env.TEST_ENDPOINT
  describe('GET fabcut/cutting/orders/:OC', () => {
    const path = '/fabcut/cutting/orders/'

    it('should respond with a 200 status code and corresponding details if the oc number validation was successful', async () => {
      const { ocNumber } = await orderRepository.getOcNumberForTest()

      const updatedPath = path + `${ocNumber}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('items')
      response.body.should.have.property('locations')
      response.body.should.have.property('fitTypes')
      response.body.items.should.be.a('array')
      response.body.locations.should.be.a('array')
      response.body.fitTypes.should.be.a('array')
      response.body.items.map(element => {
        element.should.be.a('string')
      })
      response.body.locations.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('location')
        obj.should.have.property('locationName')
        obj.should.have.property('locationType')
        obj.location.should.be.a('string')
        obj.locationName.should.be.a('string')
        obj.locationType.should.be.a('string')
      })

      response.body.fitTypes.map(element => {
        element.should.be.a('string')
      })
    })
  })

  describe('POST fabcut/cutting/orders/:OC', () => {
    const path = '/fabcut/cutting/orders/'

    it('should respond with a 200 status code and boolean true if the order details were inserted successfully', async () => {
      const { ocNumber } = await orderRepository.getOcNumberForTest()

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const updatedPath = path + `${ocNumber}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location,
          itemCode: faker.datatype.string(),
          itemDescription: faker.datatype.string(),
          fitType: faker.datatype.string(),
          approvedConsumption: faker.datatype.number(),
          sizeQuantities: [{
            size: faker.datatype.string(2),
            quantity: faker.datatype.number()
          }]
        })

      await locationRepository.deleteLocation(location)
      await orderRepository.deleteOrderEnrtry(ocNumber, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('GET fabcut/cutting/orders/orderDetails', () => {
    const path = '/fabcut/cutting/orders/orderDetails'

    it('should respond with a 200 status code and corresponding details if the oc number validation was successful', async () => {
      const { ocNumber } = await orderRepository.getOcNumberForTest()

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const itemCode = faker.datatype.string()
      const fitType = faker.datatype.string()

      const postPath = '/fabcut/cutting/orders/'
      const updatedPath = postPath + `${ocNumber}`
      await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location,
          itemCode: itemCode,
          itemDescription: faker.datatype.string(),
          fitType: fitType,
          approvedConsumption: faker.datatype.number(),
          sizeQuantities: [{
            size: faker.datatype.string(2),
            quantity: faker.datatype.number()
          }]
        })

      const response = await chai.request(host)
        .get(path)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          ocNumber,
          itemCode,
          fitType,
          location
        })

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('ocNumber')
      response.body.should.have.property('location')
      response.body.should.have.property('itemCode')
      response.body.should.have.property('fitType')
      response.body.should.have.property('itemDescription')
      response.body.should.have.property('approvedConsumption')
      response.body.sizeQuantitiesList.should.be.a('array')
      response.body.sizeQuantitiesList.map(element => {
        element.should.be.a('object')
      })

      await locationRepository.deleteLocation(location)
      await orderRepository.deleteOrderEnrtry(ocNumber, location)
    })
  })

  describe('GET fabcut/cutting/orders/location/:location/oc/:OC/orderProgressDetails', () => {
    const path = '/fabcut/cutting/orders/location'

    it('should respond with a 200 status code and corresponding details if the oc number and location validation was successful', async () => {
      const { ocNumber } = await orderRepository.getOcNumberForTest()

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const updatedPath = `${path}/${location}/oc/${ocNumber}/orderProgressDetails`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('orders')
      response.body.orders.should.be.a('array')
      response.body.should.have.property('parts')
      response.body.parts.should.be.a('boolean')
      response.body.should.have.property('techPack')
      response.body.techPack.should.be.a('array')

      await locationRepository.deleteLocation(location)
    })
  })
})
