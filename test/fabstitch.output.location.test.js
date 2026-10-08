const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const faker = require('faker')
const should = chai.should()  //eslint-disable-line

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

const batchRepository = require('../src/models/fabstitch/repository/batch')
const outputRepository = require('../src/models/fabstitch/repository/output')
const locationRepository = require('../src/models/service/repository/location')
const partsRepository = require('../src/models/fabcut/repository/partBarcode')
const leaderRepository = require('../src/models/fabcut/repository/leader')
const followerRepository = require('../src/models/fabcut/repository/follower')
const markerRepository = require('../src/models/fabcut/repository/marker')
const jobRepository = require('../src/models/fabcut/repository/job')
const ProductDetails = require('../src/models/fabstitch/entities/productDetails')

const OrdertatusEnum = require('../src/models/jobwork/entities/orderStatusEnum')

chai.use(chaiHttp)

describe('fabstitch/output/location routes', () => {
  const host = process.env.TEST_ENDPOINT
  const path = '/fabstitch/output/location/'

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

  describe('GET fabstitch/output/location/:location/batchNumber/:batchNumber/sizes', () => {
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
      const itemCode = faker.datatype.string()
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
      const countryCode = faker.random.alphaNumeric(2)
      const countryName = faker.random.alphaNumeric(10)
      const augmentedSize = faker.random.alphaNumeric(1)
      const bundleNumber = faker.datatype.number({ min: 1, max: 5 })
      const { colourCode, colourDescription: colourName, productDescription } = new ProductDetails().constructMock()

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
      await outputRepository.postOutputLocationBatch(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourName, fitType, OrdertatusEnum.INHOUSE, null, outputSizeQuantites)

      const updatedPath = path + `${location}/batchNumber/${batchNumber}/sizes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          ocNumber,
          fitType,
          productCode,
          colourCode,
          orderType: OrdertatusEnum.INHOUSE
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

  describe('POST fabstitch/output/location/:location/batchNumber/:batchNumber', () => {
    it('should respond with a 200 and boolean true status', async () => {
      const { ocNumber } = await outputRepository.getValidOcNumberForTest()
      const locationEntity = new Location().constructMock()
      const { latitude, longitude, radius, location, locationName, locationType } = locationEntity
      await locationRepository.createNewLocation(latitude, longitude, radius, location, locationName, locationType)

      const { numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime } = new BatchResource().constructMock()

      const batchEntity = new Batch().constructMock()
      batchEntity.status = BatchStatusEnum.ACTIVE
      const { batchNumber, status } = batchEntity
      await batchRepository.createBatch(batchNumber, location, status, workStartTime, workEndTime, breakStartTime, breakEndTime)

      batchRepository.postBatchResource(batchNumber, location, numberOfMachines, numberOfHelpers, workStartTime, workEndTime, breakStartTime, breakEndTime)

      const { fitType, size, itemCode, itemDescription, lay, quantity } = new PartBarcode().constructMock()
      const countryCode = faker.random.alphaNumeric(2)
      const countryName = faker.random.alphaNumeric(10)
      const jobId = faker.datatype.number({ min: 10000, max: 99999 })
      const augmentedSize = faker.random.alphaNumeric(1)
      const bundleNumber = faker.datatype.number({ min: 1, max: 5 })
      const { colourCode, colourDescription: colourName, product: productCode, productDescription } = new ProductDetails().constructMock()
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

      const outputSizeQuantites = [{
        size: faker.random.alphaNumeric(2),
        outputQuantity: faker.datatype.number()
      }]

      const targetQuantity = faker.datatype.number({ min: 10000, max: 99999 })
      await batchRepository.postOCDailyTarget(batchNumber, location, ocNumber, productCode, itemDescription, targetQuantity)

      const updatedPath = path + `${location}/batchNumber/${batchNumber}`
      const response = await chai.request(host)
        .post(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .send({
          ocNumber,
          productCode,
          productDescription,
          colourCode,
          colourName,
          fitType,
          orderType: OrdertatusEnum.INHOUSE,
          outputSizeQuantites

        })
      await batchRepository.deleteBatch(batchNumber, location)
      await locationRepository.deleteLocation(location)
      await partsRepository.deleteParts(ocNumber, location)

      response.should.have.status(200)
      response.body.should.be.a('boolean')
      response.body.should.be.equal(true)
    })
  })

  describe('GET fabstitch/output/location/:location/batchNumber/:batchNumber/register', () => {
    it('should respond with a 200 and batch output details for register', async () => {
      const { ocNumber } = await outputRepository.getValidOcNumberForTest()
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
      const itemCode = faker.datatype.string()
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
      const countryCode = faker.random.alphaNumeric(2)
      const countryName = faker.random.alphaNumeric(10)
      const augmentedSize = faker.random.alphaNumeric(1)
      const bundleNumber = faker.datatype.number({ min: 1, max: 5 })
      const { colourCode, colourDescription: colourName, product: productCode, productDescription } = new ProductDetails().constructMock()
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
      await outputRepository.postOutputLocationBatch(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourName, fitType, OrdertatusEnum.INHOUSE, null, outputSizeQuantites)

      const updatedPath = path + `${location}/batchNumber/${batchNumber}/register`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          ocNumber,
          productCode,
          colourCode,
          fitType,
          orderType: OrdertatusEnum.INHOUSE
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
      expect(keys).to.have.members(['sizesFromMarker', 'outputDetails'])
      response.body.sizesFromMarker.should.be.a('array')
      response.body.outputDetails.should.be.a('array')
      response.body.sizesFromMarker.map(obj => {
        obj.should.be.a('string')
      })
      response.body.outputDetails.map(obj => {
        obj.should.be.a('object')
        obj.should.have.property('outputSize')
        obj.should.have.property('outputQuantity')
        obj.should.have.property('outputDateTime')
        obj.outputSize.should.be.a('string')
        obj.outputQuantity.should.be.a('number')
        obj.outputDateTime.should.be.a('string')
      })
    })
  })

  describe('GET fabstitch/output/location/:location/batchNumber/:batchNumber/fitTypes', () => {
    it('should respond with a 200 and an array list of fit types', async () => {
      const { ocNumber } = await outputRepository.getValidOcNumberForTest()
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
      const itemCode = faker.datatype.string()
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
      const countryCode = faker.random.alphaNumeric(2)
      const countryName = faker.random.alphaNumeric(10)
      const augmentedSize = faker.random.alphaNumeric(1)
      const bundleNumber = faker.datatype.number({ min: 1, max: 5 })
      const { colourCode, colourDescription: colourName, product: productCode, productDescription } = new ProductDetails().constructMock()

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
      await outputRepository.postOutputLocationBatch(batchNumber, location, ocNumber, productCode, productDescription, colourCode, colourName, fitType, OrdertatusEnum.INHOUSE, null, outputSizeQuantites)

      const updatedPath = path + `${location}/batchNumber/${batchNumber}/fitTypes`
      const response = await chai.request(host)
        .get(updatedPath)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
        .set('Version', '8.0')
        .query({
          ocNumber
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
})
