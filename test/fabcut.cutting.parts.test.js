process.env.NODE_ENV = 'test'

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')

const expect = chai.expect
const should = chai.should()  //eslint-disable-line
const markerRepository = require('../src/models/fabcut/repository/marker')

chai.use(chaiHttp)

const Part = require('../src/models/fabcut/entities/part')
const PartBarcode = require('../src/models/fabcut/entities/partBarcode')
const partsRepository = require('../src/models/fabcut/repository/partBarcode')

const Location = require('../src/models/service/entities/location')
const locationRepository = require('../src/models/service/repository/location')

describe('fabcut/cutting/parts routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabcut/cutting/parts/'

  // This function responsible to format query parameters to execute query in repository
  function getFormattedQueryParameter (jobId, location, fitType, lay, sizeDetails) {
    const queryParameters = []
    sizeDetails.map(sizeDetailsObject => {
      const { itemDesc, itemCode, size, augmentedSize, countryCode, countryName, quantity, barcodeDetails, bundleNumber } = sizeDetailsObject

      barcodeDetails.map(barcodeDetailsObject => {
        const { partsUnique, barcode } = barcodeDetailsObject
        let augmentedSizeValue = null
        if (augmentedSize !== 'NA') { augmentedSizeValue = augmentedSize }
        queryParameters.push([partsUnique, jobId, barcode, location, fitType, size, augmentedSizeValue, itemCode, itemDesc, lay, quantity, countryCode, countryName, bundleNumber])
      })
    })
    return queryParameters
  }

  describe('POST /fabcut/cutting/parts/:ocNo', () => {
    it('should respond with 200 status code and boolean true if the parts data was inserted successfully', async () => {
      const { ocNumber } = await markerRepository.getOcNumberForTest()
      const { style, name } = new Part().constructMock()

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
        .send({ location, style, parts: [name] })

      await partsRepository.deleteParts(ocNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })

  describe('GET /fabcut/cutting/parts/:ocNo/', () => {
    it('should respond with a 200 status code with the fetched parts data ', async () => {
      const { ocNumber } = await markerRepository.getOcNumberForTest()
      const { style, name } = new Part().constructMock()

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await partsRepository.postParts(ocNumber, location, style, [name])

      const updatedPath = path + `${ocNumber}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({ location })

      await partsRepository.deleteParts(ocNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['ocNo', 'style', 'isPartsBarcodeGenerated', 'parts'])
      response.body.ocNo.should.be.a('string')
      response.body.ocNo.should.equal(ocNumber)
      response.body.style.should.be.a('string')
      response.body.isPartsBarcodeGenerated.should.be.a('boolean')
      response.body.parts.should.be.a('array')
      response.body.parts.forEach(item => {
        const keys = Object.keys(item)
        expect(keys).to.have.members(['partsUnique', 'part', 'isSelected'])
        item.partsUnique.should.be.a('number')
        item.part.should.be.a('string')
        item.isSelected.should.be.a('number')
      })
    })
  })

  describe('DELETE /fabcut/cutting/parts/:ocNo', () => {
    it('should respond with a 200 status code and boolean true after successfully deleting the parts for an OC', async () => {
      const { ocNumber } = await markerRepository.getOcNumberForTest()
      const { style, name } = new Part().constructMock()

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await partsRepository.postParts(ocNumber, location, style, [name])

      const updatedPath = path + `${ocNumber}`
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ location })

      await partsRepository.deleteParts(ocNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  // Parts Barcode
  describe('POST /fabcut/cutting/parts/barcode/:ocNo', () => {
    it('should respond with 200 status code and boolean true if the barcode details were inserted successfully', async () => {
      const { ocNumber } = await markerRepository.getOcNumberForTest()
      const { fitType, size, itemCode, itemDescription, lay, quantity } = new PartBarcode().constructMock()
      const countryCode = faker.random.alphaNumeric(2)
      const countryName = faker.random.alphaNumeric(10)
      const jobId = faker.datatype.number({ min: 10000, max: 99999 })
      const augmentedSize = faker.random.alphaNumeric(1)
      const bundleNumber = faker.datatype.number({ min: 1, max: 1 })

      const { style, name } = new Part().constructMock()

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await partsRepository.postParts(ocNumber, location, style, [name])

      const { parts } = await partsRepository.getParts(ocNumber, location)

      const barcodeDetails = parts.map(resultObject => {
        const { partsUnique, part } = resultObject
        return { partsUnique, part, barcode: faker.random.alphaNumeric(9) }
      })

      const updatedPath = path + `barcode/${ocNumber}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ location, jobId, fitType, lay, sizeDetails: [{ itemCode, itemDesc: itemDescription, size, augmentedSize, countryCode, countryName, quantity, bundleNumber, barcodeDetails }] })

      await partsRepository.deleteParts(ocNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })

  describe('GET /fabcut/cutting/parts/barcode/:barcode/', () => {
    it('should respond with a 200 status code with the fetched barcode details', async () => {
      const { location, fitType, size, itemCode, itemDescription, lay, quantity } = new PartBarcode().constructMock()
      const countryCode = faker.random.alphaNumeric(2)
      const countryName = faker.random.alphaNumeric(10)
      const jobId = faker.datatype.number({ min: 10000, max: 99999 })
      const augmentedSize = faker.random.alphaNumeric(1)
      const bundleNumber = faker.datatype.number({ min: 1, max: 5 })
      let barcode; let ocNumber; let style; let name = null

      const partDetails = await partsRepository.getPartDetailsForTest()
      const barcodeDetails = partDetails.map(resultObject => {
        const { ocNo, styleName, partsUnique, part } = resultObject
        barcode = faker.random.alphaNumeric(9)
        ocNumber = ocNo
        style = styleName
        name = part
        return { partsUnique, part, barcode }
      })
      const sizeDetails = [{ itemCode, itemDesc: itemDescription, size, augmentedSize, countryCode, countryName, quantity, bundleNumber, barcodeDetails }]
      const queryParameters = getFormattedQueryParameter(jobId, location, fitType, lay, sizeDetails)
      await partsRepository.postPartsBarcodes(queryParameters)

      const updatedPath = path + `barcode/${barcode}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      partDetails.map(async ({ barcode }) => {
        await partsRepository.deletePartsBarcode(barcode)
      })

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['barcode', 'ocNumber', 'style', 'lay', 'quantity', 'itemCode', 'fitType', 'itemDesc', 'partName', 'size', 'location'])
      response.body.barcode.should.be.a('string')
      response.body.barcode.should.equal(barcode)
      response.body.ocNumber.should.be.a('string')
      response.body.ocNumber.should.equal(ocNumber)
      response.body.itemCode.should.be.a('string')
      response.body.itemCode.should.equal(itemCode)
      response.body.fitType.should.be.a('string')
      response.body.fitType.should.equal(fitType)
      response.body.style.should.be.a('string')
      response.body.style.should.equal(style)
      response.body.partName.should.be.a('string')
      response.body.partName.should.equal(name)
      response.body.itemDesc.should.be.a('string')
      response.body.itemDesc.should.equal(itemDescription)
      response.body.size.should.be.a('string')
      response.body.size.should.equal(size)
      response.body.quantity.should.be.a('number')
      response.body.quantity.should.equal(quantity)
      response.body.lay.should.be.a('number')
      response.body.lay.should.equal(lay)
      response.body.location.should.be.a('string')
      response.body.location.should.equal(location)
    })
  })

  describe('DELETE /fabcut/cutting/parts/barcode/:barcode', () => {
    it('should respond with a 200 status code after successfully deleting the barcode from the DB', async () => {
      const { location, fitType, size, itemCode, itemDescription, lay, quantity } = new PartBarcode().constructMock()
      const countryCode = faker.random.alphaNumeric(2)
      const countryName = faker.random.alphaNumeric(10)
      const jobId = faker.datatype.number({ min: 10000, max: 99999 })
      const augmentedSize = faker.random.alphaNumeric(1)
      const bundleNumber = faker.datatype.number({ min: 1, max: 5 })

      let barcode = null
      const partDetails = await partsRepository.getPartDetailsForTest()
      const barcodeDetails = partDetails.map(resultObject => {
        const { partsUnique, part } = resultObject
        barcode = faker.random.alphaNumeric(9)
        return { partsUnique, part, barcode }
      })
      const sizeDetails = [{ itemCode, itemDesc: itemDescription, size, augmentedSize, countryCode, countryName, quantity, bundleNumber, barcodeDetails }]
      const queryParameters = getFormattedQueryParameter(jobId, location, fitType, lay, sizeDetails)
      await partsRepository.postPartsBarcodes(queryParameters)

      const updatedPath = path + `barcode/${barcode}`
      const response = await chai.request(host)
        .delete(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      partDetails.map(async ({ barcode }) => {
        await partsRepository.deletePartsBarcode(barcode)
      })

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('GET /fabcut/cutting/parts/:ocNumber/country', () => {
    it('should respond with a 200 status code on fetch of countries from @sage', async () => {
      const { ocNumber } = await markerRepository.getOcNumberForTest()
      const updatedPath = path + `${ocNumber}/country`

      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(item => {
        item.should.be.a('string')
      })
    })
  })

  describe('PUT /fabcut/cutting/parts/:ocNo', () => {
    it('should respond with 200 status code and boolean true if the bundle selected parts updated successfully', async () => {
      const { ocNumber } = await markerRepository.getOcNumberForTest()
      const { style, name } = new Part().constructMock()
      const partsList = [name]

      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await partsRepository.postParts(ocNumber, location, style, partsList)
      const { parts } = await partsRepository.getParts(ocNumber, location)

      const updatedPath = path + `${ocNumber}`
      const response = await chai.request(host)
        .put(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({ parts })

      await partsRepository.deleteParts(ocNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      expect(response.body).to.equal(true)
    })
  })
})
