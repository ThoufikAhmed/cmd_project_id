process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const { expect } = require('chai')

const Location = require('../src/models/service/entities/location')
const Leader = require('../src/models/fabcut/entities/leader')
const Follower = require('../src/models/fabcut/entities/follower')
const DeviceStatusEnum = require('../src/models/fabcut/entities/deviceStatusEnum')

const locationRepository = require('../src/models/service/repository/location')
const leaderRepository = require('../src/models/fabcut/repository/leader')
const followerRepository = require('../src/models/fabcut/repository/follower')

chai.use(chaiHttp)
describe('fabcut/cutting/followers routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabcut/cutting/followers/'

  describe('GET fabcut/cutting/followers/:location', () => {
    it('should return a should return a 200 status code and fetch all the follower device ids and status from a location', async () => {
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
      const followerList = [followerEntity]

      const updatedPath = path + `${location}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await locationRepository.deleteLocation(location)
      await leaderRepository.deleteLeader(deviceId, location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      expect(response.body).to.deep.have.same.members(followerList)
    })
  })
})
