const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const Location = require('../src/models/service/entities/location')
const Batch = require('../src/models/fabstitch/entities/batch')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')

chai.use(chaiHttp)

describe('fabstitch/batch/resource routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/batch/'

  describe('POST fabstitch/batch/:batchNumber/resource', () => {
    it('should return a 200 with a json of true if the batch resource is inserted successfully:', async () => {
      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = path + `${batchNumber}/resource`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          location,
          numberOfMachines,
          numberOfHelpers,
          actualWorkStartTime: workStartTime,
          actualWorkEndTime: workEndTime,
          actualBreakStartTime: breakStartTime,
          actualBreakEndTime: breakEndTime
        })
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })

  describe('Get fabstitch/batch/:batchNumber/resource/validate', () => {
    it('should return a 200 with a json of true if the batch resource validate successfully:', async () => {
      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      await batchRepository.postBatchResource(batchNumber, location, numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = path + `${batchNumber}/resource/validate`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location
        })
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })
})
