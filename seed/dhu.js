const fs = require('fs')
const faker = require('faker')
const path = require('path')

const Location = require('../src/models/service/entities/location')
const Batch = require('../src/models/fabstitch/entities/batch')
const BatchResource = require('../src/models/fabstitch/entities/batchResource')
const BatchStatusEnum = require('../src/models/fabstitch/entities/batchStatusEnum')
const PartBarcode = require('../src/models/fabcut/entities/partBarcode')
const PartBundle = require('../src/models/fabcut/entities/partBundle')
const Leader = require('../src/models/fabcut/entities/leader')
const Follower = require('../src/models/fabcut/entities/follower')
const DeviceStatusEnum = require('../src/models/fabcut/entities/deviceStatusEnum')
const Marker = require('../src/models/fabcut/entities/marker')
const Part = require('../src/models/fabcut/entities/part')

const locationRepository = require('../src/models/service/repository/location')
const leaderRepository = require('../src/models/fabcut/repository/leader')
const followerRepository = require('../src/models/fabcut/repository/follower')
const batchRepository = require('../src/models/fabstitch/repository/batch')
const partsRepository = require('../src/models/fabcut/repository/partBarcode')
const markerRepository = require('../src/models/fabcut/repository/marker')
const orderRepository = require('../src/models/fabcut/repository/orders')
const jobRepository = require('../src/models/fabcut/repository/job')
const outputRepository = require('../src/models/fabstitch/repository/output')
const sageRepository = require('../src/models/sage/repository/sage')
const defectRepository = require('../src/models/fabstitch/repository/defect')

const fileHostingProvider = require('../src/utils/fileHostingProvider')

const DHUSeedFunction = async (lat, long) => {
  // Sage dependent data
  const { ocNumber } = await outputRepository.getValidOcNumberForTest()
  const companyPrefix = ocNumber.substring(0, 2).toUpperCase()
  const sageOcCompanyEntity = await this.sageRepository.getSageOcCompany(companyPrefix)
  const { companyId } = sageOcCompanyEntity

  const productsList = await sageRepository.getProductsFromSage(ocNumber, companyId)
  const { productCode } = productsList[0]
  const itemCode = productCode.substring(0, 8)

  // Location
  const locationEntity = new Location().constructMock()
  const { location, radius, locationName, locationType } = locationEntity
  await locationRepository.createNewLocation(lat, long, radius, location, locationName, locationType)

  // Cutting leader and follower
  const leaderEntity = new Leader().constructMock()
  const { deviceId: leaderDeviceId } = leaderEntity
  await leaderRepository.createLeader(leaderDeviceId, location)

  const followerEntity = new Follower().constructMock()
  followerEntity.location = location
  followerEntity.status = DeviceStatusEnum.IDLE
  const { tableNumber } = followerEntity
  const followerDeviceId = followerEntity.deviceId
  await followerRepository.createFollower(followerDeviceId, tableNumber, location)

  // Stitching Batch
  const batchEntity = new Batch().constructMock()
  batchEntity.location = location
  batchEntity.status = BatchStatusEnum.ACTIVE
  const { batchNumber, status } = batchEntity
  const { breakStartTime, breakEndTime, numberOfHelpers, numberOfMachines } = new BatchResource().constructMock()
  await batchRepository.createBatch(batchNumber, location, status, '09:00', '18:30', breakStartTime, breakEndTime)
  await batchRepository.postBatchResource(batchNumber, location, numberOfMachines, numberOfHelpers, '09:00', '18:30', breakStartTime, breakEndTime)

  // Cutting marker and job
  const markerEntity = new Marker().constructMock()
  const { markerId } = markerEntity
  const fitTypeList = await orderRepository.fetchAllFitTypes()
  const { fitType } = faker.random.arrayElement(fitTypeList)
  const layLength = faker.datatype.number({ max: 999 })
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

  // Parts and barcode in batch
  const { style, name } = new Part().constructMock()
  await partsRepository.postParts(ocNumber, location, style, [name])

  const { parts } = await partsRepository.getParts(ocNumber, location)
  const { lay } = new PartBarcode().constructMock()
  const { countryCode, countryName, augmentedSize, bundleNumber } = new PartBundle().constructMock()
  let barcode = null
  const barcodeDetails = parts.map(resultObject => {
    const { partsUnique, part } = resultObject
    barcode = faker.random.alphaNumeric(9)
    return { partsUnique, part, barcode }
  })

  const sizeDetails = [{ itemCode, itemDesc: itemDescription, size, augmentedSize, countryCode, countryName, quantity, bundleNumber, barcodeDetails }]
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
  await partsRepository.postPartsBarcodes(queryParameters)
  await batchRepository.postBarcodeInBatch(batchNumber, location, barcode)

  // Product tech pack
  const productTechPack = fs.readFileSync(path.resolve(__dirname, '../assets/img/tech_pack_dummy.jpg'), { encoding: 'base64' })
  const techPackPathAndFileName = `masterTechPack/${location}/${ocNumber}/${productCode}.txt`.toUpperCase()
  const { techPackPath } = await fileHostingProvider.uploadTechPackToProvider(techPackPathAndFileName, productTechPack)
  await defectRepository.postProductTechPack(productCode, itemDescription, ocNumber, location, techPackPath)

  const dataToBeStored = { location, batchNumber, ocNumber, markerId, leaderDeviceId, techPackPathAndFileName }
  fs.writeFileSync('seed.json', JSON.stringify(dataToBeStored))

  const seededData = `\n Seeded Data  \n\n Location: ${location} \n Batch Number: ${batchNumber} \n OC Number: ${ocNumber}
  \n Product Code: ${productCode} \n Product Description : ${itemDescription} \n Fit Type: ${fitType} \n Size : ${size} \n `
  return seededData
}

module.exports = DHUSeedFunction
