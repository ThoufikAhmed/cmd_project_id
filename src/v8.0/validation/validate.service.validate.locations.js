const Joi = require('@hapi/joi')

module.exports = {
  /** GET /service/vaidate/locations */
  getLocationValidate: {
    latitude: Joi.number().required(),
    longitude: Joi.number().required()
  }

}
