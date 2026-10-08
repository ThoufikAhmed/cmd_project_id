process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const should = chai.should()  //eslint-disable-line

chai.use(chaiHttp)

const Leader = require('../src/models/fabcut/entities/leader')
const Follower = require('../src/models/fabcut/entities/follower')
const DeviceRoleEnum = require('../src/models/fabcut/entities/deviceRoleEnum')

const leaderRepository = require('../src/models/fabcut/repository/leader')
const followerRepository = require('../src/models/fabcut/repository/follower')

describe('fabcut/cutting/registrations routes', () => {
  const host = process.env.TEST_ENDPOINT

  describe('GET fabcut/cutting/registrations/:deviceId', () => {
    const path = '/fabcut/cutting/registrations/'

    it('should respond with a 200 with the data if the device is not registered with the server', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity

      const updatedPath = path + `${deviceId}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location: location })

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('devRegStatus')
      response.body.should.have.property('role')
      response.body.devRegStatus.should.be.a('boolean')
      response.body.devRegStatus.should.equal(false)
      expect(response.body.role).to.equal(null)
    })

    it('should respond with a 200 status code and role if the device is registered as a leader', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const updatedPath = path + `${deviceId}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location: location })

      await leaderRepository.deleteLeader(deviceId, location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('devRegStatus')
      response.body.devRegStatus.should.be.a('boolean')
      response.body.devRegStatus.should.equal(true)
      response.body.should.have.property('role')
      expect(response.body.role).to.be.equal(DeviceRoleEnum.LEADER)
    })

    it('should respond with a 200 status code and role if the device is registered as a follower', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

      const updatedPath = path + `${followerDeviceId}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location: location })

      await leaderRepository.deleteLeader(deviceId, location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('devRegStatus')
      response.body.devRegStatus.should.be.a('boolean')
      response.body.devRegStatus.should.equal(true)
      response.body.should.have.property('role')
      expect(response.body.role).to.be.equal(DeviceRoleEnum.FOLLOWER)
    })
  })

  describe('POST fabcut/cutting/registrations/:deviceId', () => {
    const path = '/fabcut/cutting/registrations/'

    it('should respond with a 200 ok request and register the device as a leader at the specified location', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity

      const updatedPath = path + `${deviceId}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ location: location, role: DeviceRoleEnum.LEADER, tableNumber: 1 })

      await leaderRepository.deleteLeader(deviceId, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should respond with a 200 ok request and register the device as a follower at the specified location', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId

      const updatedPath = path + `${followerDeviceId}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ location, role: DeviceRoleEnum.FOLLOWER, tableNumber })

      await leaderRepository.deleteLeader(deviceId, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('DELETE fabcut/cutting/registrations/:deviceId', () => {
    const path = '/fabcut/cutting/registrations/'

    it('should respond with a 200 status code and boolean true if a leader was unregistered successfully', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const updatedPath = path + `${deviceId}`
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ location, role: DeviceRoleEnum.LEADER })

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should respond with a 200 status code and boolean true if a follower was unregistered successfully', async () => {
      const leaderEntity = new Leader().constructMock()
      const { deviceId, location } = leaderEntity
      await leaderRepository.createLeader(deviceId, location)

      const followerEntity = new Follower().constructMock()
      const { tableNumber } = followerEntity
      const followerDeviceId = followerEntity.deviceId
      await followerRepository.createFollower(followerDeviceId, tableNumber, location)

      const updatedPath = path + `${followerDeviceId}`
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ location, role: DeviceRoleEnum.FOLLOWER })

      await leaderRepository.deleteLeader(deviceId, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })
})
