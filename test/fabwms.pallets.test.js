const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line

const Pallet = require('../src/models/fabwms/entities/pallet')
const Rack = require('../src/models/fabwms/entities/rack')

const palletRepository = require('../src/models/fabwms/repository/pallet')
const rackRepository = require('../src/models/fabwms/repository/rack')

chai.use(chaiHttp)

describe('fabwms/pallets routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabwms/pallets'
  describe('POST fabwms/pallets/:palletBarcode', () => {
    it('should return a 200 along with a boolean of true if the pallet has already been scanned into the warehouse before', async () => {
      const palletEntity = new Pallet().constructMock()
      const { barcode, articleNumber, numberOfPieces, supplierCode, dateOfManufacture } = palletEntity

      await palletRepository.createPallet(barcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture)
      await palletRepository.assignEntryDateToPallet(barcode)

      const updatedPath = `${path}/${barcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          articleNumber,
          numberOfPieces,
          dateOfManufacture,
          supplierCode
        })

      await palletRepository.deletePalletRackAssociationEntry(barcode)
      await palletRepository.deletePallet(barcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should return a 200 along with a boolean of true if the pallet has never been scanned into the warehouse before', async () => {
      const palletEntity = new Pallet().constructMock()
      const { barcode, articleNumber, numberOfPieces, supplierCode, dateOfManufacture } = palletEntity

      const updatedPath = `${path}/${barcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          articleNumber,
          numberOfPieces,
          dateOfManufacture,
          supplierCode
        })

      await palletRepository.deletePalletRackAssociationEntry(barcode)
      await palletRepository.deletePallet(barcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('PUT fabwms/pallets/:palletBarcode', () => {
    it('should return a 200 along with a boolean of true if a pallet associated with a rack is assigned an exit date', async () => {
      const palletEntity = new Pallet().constructMock()
      const { barcode, articleNumber, numberOfPieces, supplierCode, dateOfManufacture } = palletEntity
      await palletRepository.createPallet(barcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture)

      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)

      await palletRepository.assignEntryDateToPallet(barcode)
      await palletRepository.associatePalletWithRack(barcode, rackBarcode)
      await palletRepository.dissociatePalletFromRack(barcode)

      const updatedPath = `${path}/${barcode}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await palletRepository.deletePalletRackAssociationEntry(barcode)
      await palletRepository.deletePallet(barcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should return a 200 along with a boolean of true if a pallet not associated with a rack is assigned an exit date', async () => {
      const palletEntity = new Pallet().constructMock()
      const { barcode, articleNumber, numberOfPieces, supplierCode, dateOfManufacture } = palletEntity
      await palletRepository.createPallet(barcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture)

      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)

      await palletRepository.assignEntryDateToPallet(barcode)

      const updatedPath = `${path}/${barcode}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await palletRepository.deletePalletRackAssociationEntry(barcode)
      await palletRepository.deletePallet(barcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })
})
