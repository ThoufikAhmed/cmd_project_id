const Joi = require('@hapi/joi')

module.exports = {

  cerateMachineType: {
    type_name: Joi.string().min(1).max(100).required()
  },
  updateMachineType: {
    id: Joi.number().integer().required(),
    type_name: Joi.string().min(2).max(100).required()
  },

  deleteMachineType: {
    id: Joi.number().integer().required()
  },
  createMachineMake: {
    make_name: Joi.string().min(1).max(100).required()
  },


  updateMachineMake: {
    id: Joi.number().integer().required(),
    make_name: Joi.string().min(1).max(100).required()
  },


  createOrganization: {
    org_name: Joi.string().max(100).required(),
  },

  updateOrganization: {
 id: Joi.number().integer().required(),
    org_name: Joi.string().max(100).required(),

  },
createLocation : {
    location_name: Joi.string().max(100).required(),
},

updateLocation : {
 id: Joi.number().integer().required(),
    location_name: Joi.string().max(100).required(),

},createSpecialization : {
    specialization: Joi.string().max(100).required(),
},

updateSpecialization : {
  id: Joi.number().integer().required(),
    specialization: Joi.string().max(100).required(),
 
},

createMachine : {

    machine_name: Joi.string().max(150).required(),
    machine_type: Joi.string().max(100).required(),
    machine_model: Joi.string().max(100).required(),
    specialization: Joi.string().max(100).required(),
    machine_make:Joi.string().max(100).required(),
    manufactured_date: Joi.date().required(),
    organization_name: Joi.string().max(100).required(),
    location: Joi.string().max(100).required(),
    barcode: Joi.string().max(255).allow(null, ""),
},



updateMachine : {

    id: Joi.number().integer().required(),
    machine_name: Joi.string().max(150).required(),
    machine_type: Joi.string().max(100).required(),
    machine_model: Joi.string().max(100).required(),
    machine_make: Joi.string().max(100).required(),
    manufactured_date: Joi.date().required(),
    organization_name: Joi.string().max(100).required(),
    location: Joi.string().max(100).required(),
    specialization: Joi.string().max(100).required()

},
deleteMachine : {
    id: Joi.number().integer().required()
},



getMachineById : {
    id: Joi.number().integer().required()
},



getMachinesByIds : {
    ids: Joi.array()
      .items(Joi.number().integer().required())
      .min(1)
      .required()
},
 createTask: {
    maintenance_type: Joi.string().required(),
    task_name: Joi.string().required(),
    estimated_seconds: Joi.number().integer().min(1).required(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
  },

  // ✅ UPDATE
  updateTask: {
    id: Joi.number().integer().required(),
    maintenance_type: Joi.string().optional(),
    task_name: Joi.string().optional(),
    estimated_seconds: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').optional()
  },

  

  // ✅ DELETE
  deleteTask: {
    id: Joi.number().integer().required()
  }
}