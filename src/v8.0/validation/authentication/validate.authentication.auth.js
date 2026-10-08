const Joi = require('@hapi/joi')

module.exports = {
  login: {
    username: Joi.string().required(),
    password: Joi.string().required(),
    device_info: Joi.string().allow(null, ''),
    ip_address: Joi.string().allow(null, '')
  },

  refresh: {
    refreshToken: Joi.string().required(),
    device_info: Joi.string().allow(null, '')
  },

  logout: {
    refreshToken: Joi.string().required()
  },

  logoutAll: {
    userId: Joi.number().integer().required()
  },

  createUser: {
    name: Joi.string().required(),
    contact: Joi.string().required(),
    designation: Joi.string().allow('', null),
    location_name:  Joi.string().required(),
    user_type: Joi.string().valid('ADMIN','MANAGER').required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required()
  },
  adminLogoutUser: {
  userId: Joi.number().integer().positive().required()
},
forgotPassword: {
  username: Joi.string().required()
},

resetPassword: {
  resetToken: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
},

saveDeviceToken: {
  device_token: Joi.string().required(),
  platform: Joi.string().valid('android', 'ios').required()
},

removeDeviceToken: {
  device_token: Joi.string().required()
},


updateUser : {
id: Joi.number().integer().required(),
    name: Joi.string().max(120).required(),
    contact: Joi.string().max(20).required(),
    designation: Joi.string().max(100).required(),
    location_name: Joi.string().max(100).required(),  
    user_type: Joi.string().valid("ADMIN", "MANAGER", "USER").required(),
  }

}
