const Joi = require('@hapi/joi');
// const { post } = require('../routes/inventory');
// const { getSpecializations } = require('../../models/inventory/repository/cmd');

module.exports = {

  // ======================= MACHINE INWARD =======================

  postInward: Joi.object({
     machine_id: Joi.number().required(),
     mc_type: Joi.string().trim().required(),
     mc_model: Joi.string().trim().required(),
     mc_make: Joi.string().trim().required(),
     location_name: Joi.string().trim().required(),
     transaction_type: Joi.string().valid('INWARD','OUTWARD').required(),
     batch_id: Joi.string().trim().required(),
     created_by: Joi.number().optional(),
     barcode: Joi.string().required(),
     org_id: Joi.string().required(),
     specialization: Joi.string().trim().required()

  }),

  



 postFactoryMovement: Joi.object({
 machine_id: Joi.number().required(),
 mc_type: Joi.string().trim().required(),
 mc_model: Joi.string().trim().required(),
 mc_make: Joi.string().trim().required(),
 location_name: Joi.string().trim().required(),
 transaction_type: Joi.string().valid('IN','OUT').required(),
 created_by: Joi.number().optional(),
 barcode: Joi.string().trim().required(),
 org_id: Joi.string().required(),
 specialization: Joi.string().trim().required(),
 machine_status: Joi.string().valid('RUNNING','INACTIVE','UNDER_MAINTENANCE','BREAKDOWN').optional()

}),



  // ======================= GET FACTORY LIST =======================

  getFactoryList: Joi.object({
    location_name: Joi.string().trim().required()
  }),


  // ======================= BREAKDOWN RAISE TICKET =======================

postBreakdownRaiseTicket: Joi.object({
  machine_id: Joi.number().required(),
  specialization: Joi.string().trim().required(),
  location_name: Joi.string().trim().required(),
  batch_id: Joi.string().trim().required(),
  issue_type: Joi.string().trim().required(),
  issue_description: Joi.string().allow('').optional(),
  raised_by: Joi.number().optional(),
  machine_status: Joi.string()
    .valid('RUNNING','IDLE','BREAKDOWN')
    .default('BREAKDOWN'),
  org_id: Joi.string().required()

}),
  // ======================= GET ALL ISSUE TYPES =======================
  getAllIssueTypes: Joi.object({}),


  // ======================= GET ALL MACHINES =======================
  getAllMachines: Joi.object({
    barcode: Joi.string().trim().optional()
  }),

postMachine: Joi.object({

  machine_code: Joi.string().trim().required(),
  machine_name: Joi.string().trim().required(),
  entry_datetime: Joi.date().required(),
  machine_type: Joi.string().trim().required(),
  machine_model: Joi.string().trim().required(),
  machine_make: Joi.string().trim().required(),
  manufactured_date: Joi.date().required(),
  organization_name: Joi.string().trim().required(),
  location: Joi.string().trim().required(),
  barcode: Joi.string().trim().required(),
  machine_status: Joi.string()
    .valid('ACTIVE','INACTIVE','UNDER_MAINTENANCE','BREAKDOWN')
    .required(),
  specialization: Joi.string().trim().required()


}),


getBreakdownAttendTicket: Joi.object({}),



postAcceptTicket: Joi.object({

  ticket_id: Joi.number().required()

}),

postAttendTicket: Joi.object({
  ticket_id: Joi.number().required(),
  attended_by: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  action_taken: Joi.string().trim().required(),
  remarks: Joi.string().trim().allow('').optional(),
  status: Joi.string().valid('IN_PROGRESS', 'INCOMPLETE', 'COMPLETED').required()
}),


getTpmTasks: Joi.object({
  type: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required()
  }),

postSubmitTpmMaintenance: Joi.object({
  machine_id: Joi.number().required(),
  machine_code: Joi.string().required(),
  machine_name: Joi.string().required(),
  location_name: Joi.string().required(),
  maintenance_type: Joi.string().required(),
  tasks_completed: Joi.number().allow(null).optional(),
  estimated_seconds: Joi.number().allow(null).optional(),
  time_taken_seconds: Joi.number().allow(null).optional(),
  efficiency: Joi.alternatives().try(
    Joi.number(),
    Joi.string().regex(/^\d+(\.\d+)?$/)
  ).allow(null, '').optional(),
  batch_id: Joi.string().allow('', null).optional(),
  remarks: Joi.string().allow('', null).optional(),
  performed_by: Joi.number().optional(),
  barcode: Joi.string().allow('', null).optional(),
}),


getTpmSummary: Joi.object({
  type: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required()
}),



postTpmMaintenanceTasks: Joi.object({
  maintenance_id: Joi.number().integer().required(),
  machine_id: Joi.number().integer().required(),
  tasks: Joi.array()
    .items(
      Joi.object({
        task_name: Joi.string().trim().required(),
        estimated_seconds: Joi.number().integer().min(0).required(),
        actual_seconds: Joi.number().integer().min(0).optional()
      })
    )
    .min(1)
    .required()
}),







getTpmHistory: Joi.object({
  machineId: Joi.number().required()
}),



getScanMachineDetails: Joi.object({
  barcode: Joi.string().trim().required()
}),



getMachineTypes: Joi.object({}),

getMachineMakes: Joi.object({}),

postMachineType: Joi.object({
  type_name: Joi.string().trim().required()
}),

postMachineMake: Joi.object({
  make_name: Joi.string().trim().required()
}),

getSpecializations: Joi.object({}),


getMachineByBarcode: Joi.object({
  barcode: Joi.string().trim().required()
}),


getNotifications: Joi.object({
  userId: Joi.number().optional()
}),




postHuggingFace: Joi.object({
  prompt: Joi.string().trim().required()
}),





};
