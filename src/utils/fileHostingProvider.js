/**
 * @module utils/s3Bucket
 */

const AWS = require('aws-sdk')

const s3BucketName = process.env.S3_BUCKET_NAME
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_BUCKET_ID,
  secretAccessKey: process.env.S3_BUCKET_SECRET,
  region: process.env.S3_BUCKET_REGION
})

module.exports = {
  /**
   * This function is resonsible to upload file to s3 bucket
   * @name uploadTechPackToProvider
   * @function
   * @instance
   * @memberof module:utils/s3Bucket
   * @param {String} pathAndfileName The path of the file
   * @param {String} base64 The base64 of file to upload
   * @returns {uploadTechPack} The status and techpack path  {@link module:utils/s3Bucket~getTechPack}
   */
  /**
   * @inner
   * @typedef {Object} uploadTechPack
   * @property {Boolean} uploadTechPack.status The boolean
   * @property {String} uploadTechPack.techPackPath The executed techPack path
   */
  uploadTechPackToProvider: async function (pathAndfileName, base64) {
    const params = {
      Bucket: s3BucketName,
      Key: pathAndfileName,
      Body: base64,
      ContentType: 'Text/Html'
    }
    try {
      const uploadFileResponse = await s3.upload(params).promise()
      const techPackPath = uploadFileResponse.key
      return { status: true, techPackPath }
    } catch (err) {
      return { status: false, techPackPath: null }
    }
  },

  /**
   * This function is resonsible to fetch file from s3 bucket
   * @name getTechPackFromProvider
   * @function
   * @instance
   * @memberof module:utils/s3Bucket
   * @param {String} pathAndfileName The path of the file
   * @returns {getTechPack} The status and techpack path  {@link module:utils/s3Bucket~getTechPack}
   */
  /**
   * @inner
   * @typedef {Object} getTechPack
   * @property {Boolean} getTechPack.status The boolean
   * @property {String} getTechPack.fileContent The executed file path
   */
  getTechPackFromProvider: async function (pathAndfileName) {
    const params = {
      Bucket: s3BucketName,
      Key: pathAndfileName
    }
    try {
      const file = await s3.getObject(params).promise()
      const fileContent = file.Body.toString('utf-8')
      return { status: true, fileContent }
    } catch (err) {
      return { status: false, fileContent: null }
    }
  },

  /**
   * This function is resonsible to delete file from s3 bucket
   * @name deleteTechPackFromProvider
   * @function
   * @instance
   * @memberof module:utils/s3Bucket
   * @param {String} pathAndfileName The path of the file
   * @returns {Boolean} The status of deleted techPack
   */
  deleteTechPackFromProvider: async function (pathAndfileName) {
    const params = {
      Bucket: s3BucketName,
      Key: pathAndfileName
    }
    try {
      await s3.deleteObject(params).promise()
      return true
    } catch (err) {
      return false
    }
  }
}
