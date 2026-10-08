const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line

const Location = require('../src/models/service/entities/location')
const Batch = require('../src/models/fabstitch/entities/batch')
const BatchStatusEnum = require('../src/models/fabstitch/entities/batchStatusEnum')
const Device = require('../src/models/fabstitch/entities/device')
const DeviceRoleEnum = require('../src/models/fabstitch/entities/deviceRoleEnum')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const deviceRepository = require('../src/models/fabstitch/repository/device')

chai.use(chaiHttp)

describe('fabstitch/device routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/devices/'

  describe('GET fabstitch/devices/:deviceId/registration', () => {
    it('should return a 200 along with the relevant JSON details if the device is already registered', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      batchEntity.location = location
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const deviceEntity = new Device().constructMock()
      deviceEntity.batchNumber = batchNumber
      deviceEntity.location = location
      const { deviceId, batchNumber: deviceBatchNumber, deviceRole, location: deviceLocation } = deviceEntity
      if (deviceRole === DeviceRoleEnum.Output) {
        await deviceRepository.registerOutputDevice(deviceId, deviceLocation)
      } else {
        await deviceRepository.registerInputDevice(deviceId, deviceBatchNumber, deviceLocation, deviceRole)
      }

      const updatedPath = path + `${deviceId}/registration`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location
        })

      if (deviceRole === DeviceRoleEnum.Output) {
        await deviceRepository.unregisterOutputDevice(deviceId)
      } else {
        await deviceRepository.unregisterInputDevice(deviceId)
      }
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('deviceRegistrationStatus')
      response.body.deviceRegistrationStatus.should.equal(true)
      response.body.should.have.property('role')
      response.body.should.have.property('batchNumber')
      response.body.role.should.equal(deviceRole)
      if (deviceRole === DeviceRoleEnum.Output) {
        should.equal(response.body.batchNumber, null)
      } else {
        response.body.batchNumber.should.equal(batchNumber)
      }
    })
  })

  describe('POST fabstitch/devices/:deviceId/registration', () => {
    it('should return a 200 along with a true boolean once the Input device has been registered', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, location, radius, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      batchEntity.location = location
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const deviceEntity = new Device().constructMock()
      deviceEntity.batchNumber = batchNumber
      deviceEntity.location = location
      deviceEntity.deviceRole = DeviceRoleEnum.Input
      const { deviceId, batchNumber: deviceBatchNumber, deviceRole, location: deviceLocation } = deviceEntity

      const updatedPath = path + `${deviceId}/registration`

      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          batchNumber: deviceBatchNumber,
          location: deviceLocation,
          role: deviceRole
        })

      await deviceRepository.unregisterInputDevice(deviceId)
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should return a 200 along with a true boolean once the Output device has been registered', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, location, radius, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      batchEntity.location = location
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const deviceEntity = new Device().constructMock()
      deviceEntity.batchNumber = batchNumber
      deviceEntity.location = location
      deviceEntity.deviceRole = DeviceRoleEnum.Output
      const { deviceId, batchNumber: deviceBatchNumber, deviceRole, location: deviceLocation } = deviceEntity

      const updatedPath = path + `${deviceId}/registration`

      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          batchNumber: deviceBatchNumber,
          location: deviceLocation,
          role: deviceRole
        })

      await deviceRepository.unregisterOutputDevice(deviceId)
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should return a 200 along with a true boolean once the DHU device has been registered', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, location, radius, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      batchEntity.location = location
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const deviceEntity = new Device().constructMock()
      deviceEntity.batchNumber = batchNumber
      deviceEntity.location = location
      deviceEntity.deviceRole = DeviceRoleEnum.DHU
      const { deviceId, batchNumber: deviceBatchNumber, deviceRole, location: deviceLocation } = deviceEntity

      const updatedPath = path + `${deviceId}/registration`

      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          batchNumber: deviceBatchNumber,
          location: deviceLocation,
          role: deviceRole
        })

      await deviceRepository.unregisterInputDevice(deviceId)
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('Delete fabstitch/devices/:deviceId/registration', () => {
    it('should return a 200 along with a true boolean once the device has been unregistered', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, location, radius, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      batchEntity.location = location
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const deviceEntity = new Device().constructMock()
      deviceEntity.batchNumber = batchNumber
      deviceEntity.location = location
      const { deviceId, batchNumber: deviceBatchNumber, deviceRole, location: deviceLocation } = deviceEntity

      if (deviceRole === DeviceRoleEnum.Output) {
        await deviceRepository.registerOutputDevice(deviceId, deviceLocation)
      } else {
        await deviceRepository.registerInputDevice(deviceId, deviceBatchNumber, deviceLocation, deviceRole)
      }

      const updatedPath = path + `${deviceId}/registration`

      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location: deviceLocation
        })

      if (deviceRole === DeviceRoleEnum.Output) {
        await deviceRepository.unregisterOutputDevice(deviceId)
      } else {
        await deviceRepository.unregisterInputDevice(deviceId)
      }
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })
})
