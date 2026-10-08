const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()  //eslint-disable-line
const expect = chai.expect
const faker = require('faker')

const locationRepository = require('../src/models/service/repository/location')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const partsRepository = require('../src/models/fabcut/repository/partBarcode')
const outputRepository = require('../src/models/fabstitch/repository/output')
const leaderRepository = require('../src/models/fabcut/repository/leader')
const followerRepository = require('../src/models/fabcut/repository/follower')
const markerRepository = require('../src/models/fabcut/repository/marker')
const jobRepository = require('../src/models/fabcut/repository/job')
const defectRepository = require('../src/models/fabstitch/repository/defect')

const orderStatusEnum = require('../src/models/jobwork/entities/orderStatusEnum')

const PartBundle = require('../src/models/fabcut/entities/partBundle')
const Batch = require('../src/models/fabstitch/entities/batch')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')
const Location = require('../src/models/service/entities/location')
const BatchStatusEnum = require('../src/models/fabstitch/entities/batchStatusEnum')
const PartBarcode = require('../src/models/fabcut/entities/partBarcode')
const Part = require('../src/models/fabcut/entities/part')
const Leader = require('../src/models/fabcut/entities/leader')
const Follower = require('../src/models/fabcut/entities/follower')
const DeviceStatusEnum = require('../src/models/fabcut/entities/deviceStatusEnum')
const Marker = require('../src/models/fabcut/entities/marker')
const ProductDetails = require('../src/models/fabstitch/entities/productDetails')

chai.use(chaiHttp)

describe('fabstitch/batch/:batchNumber routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/batch/'

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

  describe('GET fabstitch/batch/:batchNumber', () => {
    it('should respond with a 200 and json of true if the batch exists', async () => {
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      const batchEntity = new Batch().constructMock()
      batchEntity.location = location
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = path + `${batchNumber}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.equal(true)
    })
  })

  describe('Get fabstitch/batch/:batchNumber/schedule', () => {
    it('should return a 200 with a json of true if the batch default schedule fetch successfully:', async () => {
      const batchEntity = new Batch().constructMock()
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const updatedPath = path + `${batchNumber}/schedule`
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
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['workStartTime', 'workEndTime', 'breakStartTime', 'breakEndTime'])
      response.body.workStartTime.should.be.a('string')
      response.body.workEndTime.should.be.a('string')
      response.body.breakStartTime.should.be.a('string')
      response.body.breakEndTime.should.be.a('string')
    })
  })

  describe('GET fabstitch/batch/:batchNumber/ocNumber', () => {
    it('should return a 200 with a list of OC numbers', async () => {
      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity

      const locationEntity = new Location().constructMock()
      const { location, latitude, longitude, radius, locationName, locationType } = locationEntity

      const { workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { fitType, size, itemCode, itemDescription, lay, quantity } = new PartBarcode().constructMock()
      const { countryCode, countryName, jobId, augmentedSize, bundleNumber } = new PartBundle().constructMock()
      const partDetails = await partsRepository.getPartDetailsForTest()

      let barcode = null
      const barcodeDetails = partDetails.map(resultObject => {
        const { partsUnique, part } = resultObject
        barcode = faker.random.alphaNumeric(9)
        return { partsUnique, part, barcode }
      })
      const sizeDetails = [{ itemCode, itemDesc: itemDescription, size, augmentedSize, countryCode, countryName, quantity, bundleNumber, barcodeDetails }]
      const queryParameters = getFormattedQueryParameter(jobId, location, fitType, lay, sizeDetails)
      await partsRepository.postPartsBarcodes(queryParameters)

      await batchRepository.postBarcodeInBatch(batchNumber, location, barcode)

      const updatedPath = path + `${batchNumber}/ocNumber`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          location
        })

      partDetails.map(async ({ barcode }) => {
        await partsRepository.deletePartsBarcode(barcode)
      })
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(item => {
        item.should.be.a('string')
      })
    })
  })

  describe('GET fabstitch/batch/:batchNumber/sizes', () => {
    it('should respond with a 200 and an array list of sizes', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)
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
      const { fitType, markerId } = markerEntity
      const layLength = faker.datatype.number({ max: 999 })
      const itemCode = productCode
      const itemDescription = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const custName = faker.datatype.string()
      const styleNo = faker.datatype.string()
      const shrinkage = faker.datatype.string()
      const approvedConsumption = faker.datatype.number()
      const ratioNumber = faker.datatype.number()
      const ratioQuantity = faker.datatype.number()
      const ratioLay = faker.datatype.number()
      const jobDetailObject = [{ itemCode, itemDescription, ratioDetails: [{ size, quantity, ratio }] }]

      const markerObject = {
        custName,
        styleNo,
        shrinkage,
        fitType,
        markerUnique: markerId,
        factoryLocation: location,
        approvedConsumption,
        items: [{ itemNo: itemCode, itemDesc: itemDescription }],
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
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const { numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      batchRepository.postBatchResource(batchNumber, location, numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { lay } = new PartBarcode().constructMock()
      const { colourCode, colourDescription: colourName, productDescription } = new ProductDetails().constructMock()
      const { countryCode, countryName, augmentedSize, bundleNumber } = new PartBundle().constructMock()
      let barcode = null

      const { style, name } = new Part().constructMock()
      await partsRepository.postParts(ocNumber, location, style, [name])

      const { parts } = await partsRepository.getParts(ocNumber, location)

      const barcodeDetails = parts.map(resultObject => {
        const { partsUnique, part } = resultObject
        barcode = faker.random.alphaNumeric(9)
        return { partsUnique, part, barcode }
      })
      const sizeDetails = [{ itemCode, itemDesc: itemDescription, size, augmentedSize, countryCode, countryName, quantity, bundleNumber, barcodeDetails }]
      const queryParameters = getFormattedQueryParameter(jobId, location, fitType, lay, sizeDetails)
      await partsRepository.postPartsBarcodes(queryParameters)

      barcodeDetails.map(async barcodeDetailObject => {
        const { barcode } = barcodeDetailObject
        await batchRepository.postBarcodeInBatch(batchNumber, location, barcode)
      })

      const outputSizeQuantites = [{ size, outputQuantity: quantity }]
      await outputRepository.postOutputLocationBatch(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourName, fitType, orderStatusEnum.INHOUSE, null, outputSizeQuantites)

      const updatedPath = path + `${batchNumber}/sizes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          ocNumber,
          productCode,
          location,
          fitType
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)
      await partsRepository.deleteParts(ocNumber, location)
      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.map(obj => {
        obj.should.be.a('string')
      })
    })
  })

  describe('GET fabstitch/batch/:batchNumber/fitTypes', () => {
    it('should respond with a 200 and an object with orderType and list of fitTypes', async () => {
      const { productCode } = await batchRepository.getValidProductForTest()
      const ocNumber = productCode.substring(0, 7)
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
      const { fitType, markerId } = markerEntity
      const layLength = faker.datatype.number({ max: 999 })
      const itemCode = productCode
      const itemDescription = faker.datatype.string()
      const size = faker.random.alphaNumeric(2)
      const quantity = faker.datatype.number()
      const ratio = faker.datatype.number()
      const custName = faker.datatype.string()
      const styleNo = faker.datatype.string()
      const shrinkage = faker.datatype.string()
      const approvedConsumption = faker.datatype.number()
      const ratioNumber = faker.datatype.number()
      const ratioQuantity = faker.datatype.number()
      const ratioLay = faker.datatype.number()
      const jobDetailObject = [{ itemCode, itemDescription, ratioDetails: [{ size, quantity, ratio }] }]

      const markerObject = {
        custName,
        styleNo,
        shrinkage,
        fitType,
        markerUnique: markerId,
        factoryLocation: location,
        approvedConsumption,
        items: [{ itemNo: itemCode, itemDesc: itemDescription }],
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
      const jobId = await jobRepository.assignJobToFollower(markerId, followerEntity, location, layLength, jobDetailObject, {})

      const { numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      batchRepository.postBatchResource(batchNumber, location, numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { lay } = new PartBarcode().constructMock()
      const { colourCode, colourDescription: colourName, productDescription } = new ProductDetails().constructMock()
      const { countryCode, countryName, augmentedSize, bundleNumber } = new PartBundle().constructMock()
      let barcode = null

      const { style, name } = new Part().constructMock()
      await partsRepository.postParts(ocNumber, location, style, [name])

      const { parts } = await partsRepository.getParts(ocNumber, location)

      const barcodeDetails = parts.map(resultObject => {
        const { partsUnique, part } = resultObject
        barcode = faker.random.alphaNumeric(9)
        return { partsUnique, part, barcode }
      })
      const sizeDetails = [{ itemCode, itemDesc: itemDescription, size, augmentedSize, countryCode, countryName, quantity, bundleNumber, barcodeDetails }]
      const queryParameters = getFormattedQueryParameter(jobId, location, fitType, lay, sizeDetails)
      await partsRepository.postPartsBarcodes(queryParameters)

      barcodeDetails.map(async barcodeDetailObject => {
        const { barcode } = barcodeDetailObject
        await batchRepository.postBarcodeInBatch(batchNumber, location, barcode)
      })

      const outputSizeQuantites = [{ size, outputQuantity: quantity }]
      await outputRepository.postOutputLocationBatch(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourName, fitType, orderStatusEnum.INHOUSE, null, outputSizeQuantites)

      const updatedPath = path + `${batchNumber}/fitTypes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          ocNumber,
          productCode,
          location
        })

      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)
      await partsRepository.deleteParts(ocNumber, location)
      await leaderRepository.deleteLeader(deviceId, location)
      await markerRepository.removeMarker(markerId)
      await jobRepository.deleteJob(jobId)

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['orderType', 'fitTypes'])
      response.body.orderType.should.be.a('string')
      response.body.fitTypes.should.be.a('array')
      response.body.fitTypes.map(obj => {
        obj.should.be.a('string')
      })
    })
  })

  describe('GET /fabstitch/product/label/:qrCode', () => {
    it('should return a 200 with a json of true if product label Qr code details', async () => {
      const validProductLabelBarcodeObject = await defectRepository.getValidProductQrForTest()
      const { qrCode } = validProductLabelBarcodeObject

      const updatedPath = `/fabstitch/product/label/${qrCode}`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')

      response.should.have.status(200)
      response.body.should.be.a('object')
      const keys = Object.keys(response.body)
      expect(keys).to.have.members(['ocNumber', 'location', 'customerName', 'style', 'styleDescription',
        'productCode', 'productDescription', 'fitType', 'colourCode', 'colourDescription',
        'size', 'batchNumber', 'qrCode', 'layNumber', 'serialNumber',
        'buyerPoNumber', 'bundleBarcode', 'productShade', 'productShrinkage', 'productPattern'])
      response.body.ocNumber.should.be.a('string')
      response.body.location.should.be.a('string')
      response.body.customerName.should.be.a('string')
      response.body.style.should.be.a('string')
      response.body.styleDescription.should.be.a('string')
      response.body.productCode.should.be.a('string')
      response.body.productDescription.should.be.a('string')
      response.body.fitType.should.be.a('string')
      response.body.colourCode.should.be.a('string')
      response.body.colourDescription.should.be.a('string')
      response.body.size.should.be.a('string')
      response.body.batchNumber.should.be.a('string')
      response.body.qrCode.should.be.a('string')
      response.body.layNumber.should.be.a('number')
      response.body.serialNumber.should.be.a('number')
      response.body.bundleBarcode.should.be.a('string')
    })
  })
})
