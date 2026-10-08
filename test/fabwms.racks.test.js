const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const faker = require('faker')

const Rack = require('../src/models/fabwms/entities/rack')
const Pallet = require('../src/models/fabwms/entities/pallet')
const Fabric = require('../src/models/fabscan/entities/fabric')
const poRepository = require('../src/models/fabscan/repository/po')
const fabricRepository = require('../src/models/fabwms/repository/fabric')

const rackRepository = require('../src/models/fabwms/repository/rack')
const palletRepository = require('../src/models/fabwms/repository/pallet')
const { expect } = require('chai')

chai.use(chaiHttp)

describe('fabwms/racks routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabwms/racks/'

  const { barcode, ocNumber } = new Fabric().constructMock()
  const custName = faker.random.alphaNumeric(10)
  const styleNo = faker.random.alphaNumeric(5)
  const styleDesc = faker.random.alphaNumeric(10)
  const itemDesc = faker.random.alphaNumeric(10)
  const name = faker.random.alphaNumeric(10)
  const rollLength = faker.datatype.number({ min: 1, max: 100 })
  const tableData = [
    {
      roll: barcode,
      length: rollLength,
      supplierRollNo: `${faker.datatype.number({ min: 1, max: 10 })}`
    }
  ]

  describe('GET fabwms/racks/:rackBarcode', () => {
    it('should return a 200 along with the list of pallets currently stored in the rack', async () => {
      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)

      const palletEntities = new Array(5).fill(0).map(el => new Pallet().constructMock())
      for (let i = 0; i < palletEntities.length; i++) {
        palletEntities[i].rack = rackEntity
        const { barcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture } = palletEntities[i]
        await palletRepository.createPallet(barcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture)
        await palletRepository.assignEntryDateToPallet(barcode)
        await palletRepository.associatePalletWithRack(barcode, rackBarcode)
      }

      const updatedPath = path + `${rackBarcode}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      for (let i = 0; i < palletEntities.length; i++) {
        const { barcode } = palletEntities[i]
        await palletRepository.dissociatePalletFromRack(barcode)
        await palletRepository.deletePalletRackAssociationEntry(barcode)
        await palletRepository.deletePallet(barcode)
      }
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('array')
      expect(response.body).to.deep.have.same.members(palletEntities)
    })
  })

  describe('POST fabwms/racks/:rackBarcode/pallets/:palletBarcode', () => {
    it('should return a 200 along with a boolean of true if the pallet barcode is successfully associated with a rack', async () => {
      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)

      const palletEntity = new Pallet().constructMock()
      palletEntity.rack = new Rack()
      const { barcode: palletBarcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture } = palletEntity
      await palletRepository.createPallet(palletBarcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture)
      await palletRepository.assignEntryDateToPallet(palletBarcode)

      const updatedPath = `${path}${rackBarcode}/pallets/${palletBarcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await palletRepository.deletePalletRackAssociationEntry(palletBarcode)
      await palletRepository.deletePallet(palletBarcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })

    it('should return a 200 along with a boolean of true if a pallet barcode that was previously dissociated from a rack is associated with another rack', async () => {
      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)

      const palletEntity = new Pallet().constructMock()
      palletEntity.rack = new Rack()
      const { barcode: palletBarcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture } = palletEntity
      await palletRepository.createPallet(palletBarcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture)
      await palletRepository.assignEntryDateToPallet(palletBarcode)

      await palletRepository.associatePalletWithRack(palletBarcode, rackBarcode)
      await palletRepository.dissociatePalletFromRack(palletBarcode)

      const updatedPath = `${path}${rackBarcode}/pallets/${palletBarcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await palletRepository.deletePalletRackAssociationEntry(palletBarcode)
      await palletRepository.deletePallet(palletBarcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('PUT fabwms/racks/pallets/:palletBarcode', () => {
    it('should return a 200 along with a boolean of true if the pallet is successfully removed from a rack in the warehouse', async () => {
      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)

      const palletEntity = new Pallet().constructMock()
      palletEntity.rack = new Rack()
      const { barcode: palletBarcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture } = palletEntity
      await palletRepository.createPallet(palletBarcode, articleNumber, supplierCode, numberOfPieces, dateOfManufacture)
      await palletRepository.assignEntryDateToPallet(palletBarcode)
      await palletRepository.associatePalletWithRack(palletBarcode, rackBarcode)

      const updatedPath = `${path}pallets/${palletBarcode}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await palletRepository.deletePalletRackAssociationEntry(palletBarcode)
      await palletRepository.deletePallet(palletBarcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('GET fabwms/racks/:rackBarcode/fabric', () => {
    it('should return a 200 along with the list of fabric details in the rack', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }
      await poRepository.postPoDetails(poNumber, dataObject)

      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)
      await fabricRepository.createFabricAndEntryDate(barcode)
      await fabricRepository.associateFabricWithRack(barcode, rackBarcode)

      const updatedPath = path + `${rackBarcode}/fabric`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)
      await fabricRepository.deleteFabricBarcode(barcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(fabricDetailObject => {
        fabricDetailObject.should.be.a('object')
        fabricDetailObject.should.have.property('poNumber')
        fabricDetailObject.should.have.property('itemCode')
        fabricDetailObject.should.have.property('itemDescription')
        fabricDetailObject.should.have.property('fabricBarcodeDetails')
        fabricDetailObject.poNumber.should.be.a('string')
        fabricDetailObject.itemCode.should.be.a('string')
        fabricDetailObject.itemDescription.should.be.a('string')
        fabricDetailObject.fabricBarcodeDetails.should.be.a('array')
        fabricDetailObject.fabricBarcodeDetails.map(fabricBarcodeObject => {
          fabricBarcodeObject.should.have.property('fabricBarcode')
          fabricBarcodeObject.should.have.property('fabricLength')
          fabricBarcodeObject.fabricBarcode.should.be.a('string')
          fabricBarcodeObject.fabricLength.should.be.a('number')
        })
      })
    })
  })

  describe('POST fabwms/racks/:rackBarcode/fabric/:fabricBarcode', () => {
    it('should return a 200 along with a boolean of true if the fabric barcode is successfully associated with a rack', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }
      await poRepository.postPoDetails(poNumber, dataObject)

      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)
      await fabricRepository.createFabricAndEntryDate(barcode)

      const updatedPath = `${path}${rackBarcode}/fabric/${barcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)
      await fabricRepository.deleteFabricBarcode(barcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['poNumber', 'fabricLength', 'itemCode', 'itemDescription'])
      response.body.poNumber.should.be.a('string')
      response.body.fabricLength.should.be.a('number')
      response.body.itemCode.should.be.a('string')
      response.body.itemDescription.should.be.a('string')
    })

    it('should return a 200 along with a boolean of true if a fabric barcode that was previously dissociated from a rack is associated with another rack', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }
      await poRepository.postPoDetails(poNumber, dataObject)

      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)
      await fabricRepository.createFabricAndEntryDate(barcode)

      await fabricRepository.associateFabricWithRack(barcode, rackBarcode)
      await fabricRepository.dissociateFabricFromRack(barcode)

      const updatedPath = `${path}${rackBarcode}/fabric/${barcode}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)
      await fabricRepository.deleteFabricBarcode(barcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['poNumber', 'fabricLength', 'itemCode', 'itemDescription'])
      response.body.poNumber.should.be.a('string')
      response.body.fabricLength.should.be.a('number')
      response.body.itemCode.should.be.a('string')
      response.body.itemDescription.should.be.a('string')
    })
  })

  describe('PUT fabwms/racks/fabric/:fabricBarcode', () => {
    it('should return a 200 along with a boolean of true if the fabric is successfully removed from a rack in the warehouse', async () => {
      const { poNumber, itemCode } = await poRepository.getValidPoNumberForTest()
      const dataObject = { OC: ocNumber, custName, styleNo, styleDesc, itemNo: itemCode, itemDesc, name, tableData }
      await poRepository.postPoDetails(poNumber, dataObject)

      const rackEntity = new Rack().constructMock()
      const { rackBarcode } = rackEntity
      await rackRepository.createRack(rackBarcode)
      await fabricRepository.createFabricAndEntryDate(barcode)
      await fabricRepository.associateFabricWithRack(barcode, rackBarcode)

      const updatedPath = `${path}fabric/${barcode}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      await poRepository.deletePoDetails(ocNumber)
      await fabricRepository.deleteFabricBarcode(barcode)
      await rackRepository.deleteRack(rackBarcode)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })
})
