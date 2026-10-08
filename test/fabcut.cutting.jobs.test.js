process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const expect = chai.expect
const should = chai.should()  //eslint-disable-line

chai.use(chaiHttp)

const Follower = require('../src/models/fabcut/entities/follower')
const Leader = require('../src/models/fabcut/entities/leader')
const Marker = require('../src/models/fabcut/entities/marker')
const FabricBarcode = require('../src/models/fabcut/entities/fabricBarcode')
const Location = require('../src/models/service/entities/location')

const leaderRepository = require('../src/models/fabcut/repository/leader')
const followerRepository = require('../src/models/fabcut/repository/follower')
const markerRepository = require('../src/models/fabcut/repository/marker')
const orderRepository = require('../src/models/fabcut/repository/orders')
const jobRepository = require('../src/models/fabcut/repository/job')
const fabricBarcodeRepository = require('../src/models/fabcut/repository/fabricBarcode')
const locationRepository = require('../src/models/service/repository/location')

const DeviceStatusEnum = require('../src/models/fabcut/entities/deviceStatusEnum')

describe('fabcut/cutting/jobs routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabcut/cutting/jobs/'

  describe('POST fabcut/cutting/jobs/:deviceId', () => {
    it('should respond with a 200 status code with the job id if the job is assigned successfully', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      followerEntity.location = location
      followerEntity.status = DeviceStatusEnum.IDLE
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

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
      const shade = faker.datatype.string()
      const shrinkageForJob = faker.datatype.string()
      const pattern = faker.datatype.string()

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
      await orderRepository.insertOrderDetails(ocNumber, location, itemCode, itemDesc, fitType, approvedConsumption, [{ size, quantity }])

      const updatedPath = path + `${followerDeviceId}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          markerUnique: markerId,
          location,
          layLength: faker.datatype.number(),
          jobDetails: [{
            itemCode,
            itemDesc,
            shade,
            shrinkage: shrinkageForJob,
            pattern,
            ratioDetails: [{ size, quantity, ratio }]
          }]
        })

      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await orderRepository.deleteOrderEnrtry(ocNumber, location)
      const jobId = response.body
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('number')
    })
  })

  describe('DELETE fabcut/cutting/jobs/:jobId', () => {
    it('should respond with a 200 status code and boolean true if the job is deleted successfully', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      followerEntity.location = location
      followerEntity.status = DeviceStatusEnum.IDLE
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const layLength = faker.datatype.number({ max: 999 })
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const jobDetailObject = [{ itemCode, itemDesc, ratioDetails: [{ size, quantity, ratio }] }]

      await markerRepository.createTestMarker(ocNumber, markerId, fitType, location)
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const updatedPath = path + `${jobId}`
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })

  describe('GET fabcut/cutting/jobs/:deviceId', () => {
    it('should respond with a 200 status code with the job details of the job assigned to the follower', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      followerEntity.location = location
      followerEntity.status = DeviceStatusEnum.IDLE
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const layLength = faker.datatype.number({ max: 999 })
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const jobDetailObject = [{ itemCode, itemDesc, ratioDetails: [{ size, quantity, ratio }] }]

      await markerRepository.createTestMarker(ocNumber, markerId, fitType, location)
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const updatedPath = path + `${followerDeviceId}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location: location })

      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['jobId', 'ocNumber', 'layLength', 'fitType', 'jobDetails'])
      response.body.jobId.should.be.a('number')
      expect(response.body.jobId).to.equal(jobId)
      response.body.ocNumber.should.be.a('string')
      expect(response.body.ocNumber).to.equal(ocNumber)
      response.body.layLength.should.be.a('number')
      expect(response.body.layLength).to.equal(layLength)
      response.body.fitType.should.be.a('string')
      expect(response.body.fitType).to.equal(fitType)
      response.body.jobDetails.should.be.a('array')
      response.body.jobDetails.forEach(jobDetailsObject => {
        const keys = Object.keys(jobDetailsObject)
        expect(keys).to.have.members(['itemCode', 'itemDesc', 'ratioDetails', 'layNumber'])
        jobDetailsObject.itemCode.should.be.a('string')
        jobDetailsObject.layNumber.should.be.a('number')
        jobDetailsObject.ratioDetails.should.be.a('array')

        jobDetailsObject.ratioDetails.forEach(ratioDetailsObject => {
          const keys = Object.keys(ratioDetailsObject)
          expect(keys).to.have.members(['size', 'quantity', 'ratio'])
          ratioDetailsObject.size.should.be.a('string')
          ratioDetailsObject.quantity.should.be.a('number')
          ratioDetailsObject.ratio.should.be.a('number')
        })
      })
    })
  })

  describe('POST fabcut/cutting/jobs/:jobId/barcodes/:barcode', () => {
    it('should respond with a 200 status code after successfully posting a barcode to a job', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      followerEntity.location = location
      followerEntity.status = DeviceStatusEnum.IDLE
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const layLength = faker.datatype.number({ max: 999 })
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const jobDetailObject = [{ itemCode, itemDesc, ratioDetails: [{ size, quantity, ratio }] }]

      await markerRepository.createTestMarker(ocNumber, markerId, fitType, location)
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const { barcode, rollLength } = new FabricBarcode().constructMock()
      const userName = faker.datatype.string()
      await fabricBarcodeRepository.createTestFabricBarcode(ocNumber, barcode, rollLength, itemCode, userName)

      const updatedPath = path + `${jobId}/barcodes/${barcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ itemCode })

      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await fabricBarcodeRepository.deleteTestFabricBarcode(ocNumber)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['length', 'plies'])
      response.body.length.should.be.a('number')
      response.body.plies.should.be.a('number')
    })
  })

  describe('DELETE fabcut/cutting/jobs/:jobId/barcodes/:barcode', () => {
    it('should respond with a 200 status code if the barcode is removed successfully from the assigned job', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      followerEntity.location = location
      followerEntity.status = DeviceStatusEnum.IDLE
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const layLength = faker.datatype.number({ max: 999 })
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const jobDetailObject = [{ itemCode, itemDesc, ratioDetails: [{ size, quantity, ratio }] }]

      await markerRepository.createTestMarker(ocNumber, markerId, fitType, location)
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const { barcode, rollLength } = new FabricBarcode().constructMock()
      await jobRepository.postBarcodeIntoJob(jobId, barcode, itemCode, rollLength)

      const updatedPath = path + `${jobId}/barcodes/${barcode}`
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })

  describe('PUT fabcut/cutting/jobs/:jobId/barcodes/:barcode', () => {
    it('should respond with a 200 status code after updating actual quantity for the barcode in the assigned job', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      followerEntity.location = location
      followerEntity.status = DeviceStatusEnum.IDLE
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const layLength = faker.datatype.number({ max: 999 })
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const ratio = faker.datatype.number()
      const quantity = faker.datatype.number({ min: ratio })
      const jobDetailObject = [{ itemCode, itemDesc, ratioDetails: [{ size, quantity, ratio }] }]

      await markerRepository.createTestMarker(ocNumber, markerId, fitType, location)
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const { barcode, rollLength } = new FabricBarcode().constructMock()
      await jobRepository.postBarcodeIntoJob(jobId, barcode, itemCode, rollLength)

      const updatedPath = path + `${jobId}/barcodes/${barcode}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ actualPlies: faker.datatype.number() })

      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })

  describe('PUT fabcut/cutting/jobs/:jobId', () => {
    it('should return a 200 status code and boolean true if the job is successfully completed', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      followerEntity.location = location
      followerEntity.status = DeviceStatusEnum.IDLE
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

      const markerEntity = new Marker().constructMock()
      const { ocNumber, fitType, markerId } = markerEntity
      const layLength = faker.datatype.number({ max: 999 })
      const itemCode = faker.datatype.string()
      const itemDesc = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const ratio = faker.datatype.number()
      const quantity = faker.datatype.number({ min: ratio })
      const jobDetailObject = [{ itemCode, itemDesc, ratioDetails: [{ size, quantity, ratio }] }]

      await markerRepository.createTestMarker(ocNumber, markerId, fitType, location)
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const { barcode, rollLength } = new FabricBarcode().constructMock()
      await jobRepository.postBarcodeIntoJob(jobId, barcode, itemCode, rollLength)
      await jobRepository.updateBarcodeInJob(jobId, barcode, quantity)

      const updatedPath = path + `${jobId}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })

  describe('GET fabcut/cutting/jobs/fetch/:location', () => {
    it('should return a 200 with the job details for the current day in the given location', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const leaderEntity = new Leader().constructMock()
      const { deviceId } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      followerEntity.location = location
      followerEntity.status = DeviceStatusEnum.IDLE
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

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
      const ratioLay = faker.datatype.number({ min: 10, max: 20 })

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

      const layLength = faker.datatype.number({ max: 999 })
      const jobDetailObject = [{ itemCode, itemDesc, ratioDetails: [{ size, quantity, ratio }] }]
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const updatedPath = path + `fetch/${location}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await locationRepository.deleteLocation(location)
      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.forEach(item => {
        const keys = Object.keys(item)
        expect(keys).to.have.members(['jobId', 'tableNum', 'ratio', 'lay', 'ocNo', 'fitType', 'itemCode', 'itemDesc', 'size', 'quantity'])
        item.jobId.should.be.a('number')
        item.tableNum.should.be.a('number')
        item.itemCode.should.be.a('string')
        item.ratio.should.be.a('number')
        item.lay.should.be.a('number')
        item.ocNo.should.be.a('string')
        item.fitType.should.be.a('string')
        item.itemDesc.should.be.a('string')
        item.size.should.be.a('string')
        item.quantity.should.be.a('number')
      })
    })
  })
})
