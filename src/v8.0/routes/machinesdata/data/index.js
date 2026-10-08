const express = require("express");
const router = express.Router();

const machinesdatacontrollers = require("../../../controllers/machinesdata/index");
const asyncMiddleware = require("../../../../middleware/async");
const validationMiddleware = require("../../../../middleware/validationMiddleware");
const validation = require("../../../validation/machinedata/validate.machinesdata.data");
const loggerMiddleware = require("../../../../middleware/loggerMiddleware");


const authMiddleware = require("../../../../middleware/authMiddlewares");
const roleMiddleware = require("../../../../middleware/ruleMiddleware");

/**
 * Route to create a new machine type
 * @name POST /machinetype
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {Object} req.body - The request body
 * @returns {Object} The created machine type object
 */
router.post("/machinetype",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.cerateMachineType),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.postMachineTypeController.execute(req, res);
  })
);

/**
 * Route to update an existing machine type
 * @name PUT /update/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The machine type ID
 * @param {Object} req.body - The request body with updated machine type details
 * @returns {Object} The updated machine type object
 */
router.put("/update/:id",authMiddleware,roleMiddleware(["ADMIN"]),validationMiddleware(validation.updateMachineType),asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.updateMachineTypeController.execute(req, res);
  })
);
/**
 * Route to delete a machine type
 * @name DELETE /delete/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The machine type ID
 * @returns {Object} Confirmation of deletion
 */
// DELETE
router.delete("/delete/:id",authMiddleware,roleMiddleware(["ADMIN"]),validationMiddleware(validation.deleteMachineType),asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.deleteMachineTypeController.execute(req, res);
  })
);

/**
 * Route to get all machine types
 * @name GET /machinetypeall
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Array<Object>} The list of all machine types
 */
router.get("/machinetypeall",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.getAllMachineTypesController.execute(req, res);
  })
);
/**
 * Route to create a new machine make
 * @name POST /make/cerate
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {Object} req.body - The request body
 * @returns {Object} The created machine make object
 */
router.post("/make/cerate",authMiddleware,roleMiddleware(["ADMIN"]),validationMiddleware(validation.createMachineMake),asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.postMachineMakeController.execute(req, res);
  })
);

/**
 * Route to update an existing machine make
 * @name PUT /make/update/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The machine make ID
 * @param {Object} req.body - The request body with updated machine make details
 * @returns {Object} The updated machine make object
 */
router.put("/make/update/:id",authMiddleware, roleMiddleware(["ADMIN"]), validationMiddleware(validation.updateMachineMake),asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.updateMachineMakeController.execute(req, res);
  })
);

/**
 * Route to delete a machine make
 * @name DELETE /make/delete/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The machine make ID
 * @returns {Object} Confirmation of deletion
 */
router.delete("/make/delete/:id",authMiddleware,roleMiddleware(["ADMIN"]),asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.deleteMachineMakeController.execute(req, res);
  })
);
/**
 * Route to get all machine makes
 * @name GET /makeall
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Array<Object>} The list of all machine makes
 */
router.get("/makeall",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.getallmachinemakeController.execute(req, res);
  })
);

/**
 * Route to get all organizations
 * @name GET /organizationall
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Array<Object>} The list of all organizations
 */
router.get("/organizationall",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.getallorganzationController.execute(req,res);
  })
);

/**
 * Route to create a new organization
 * @name POST /organization
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {Object} req.body - The request body
 * @returns {Object} The created organization object
 */
router.post("/organization",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.createOrganization),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.postOrganizationController.execute(req, res);
  })
);

/**
 * Route to update an existing organization
 * @name PUT /organization/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The organization ID
 * @param {Object} req.body - The request body with updated organization details
 * @returns {Object} The updated organization object
 */
router.put("/organization/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.updateOrganization),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.updateOrganizationController.execute(req,res );
  })
);
/**
 * Route to delete an organization
 * @name DELETE /del/organization/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The organization ID
 * @returns {Object} Confirmation of deletion
 */
router.delete("/del/organization/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.deleteOrganizationController.execute(req,res);
  })
);

/**
 * Route to create a new location
 * @name POST /location
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {Object} req.body - The request body
 * @returns {Object} The created location object
 */
// CREATE
router.post("/location",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.createLocation),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.postLocationController.execute(req, res);
  })
);
/**
 * Route to get all locations
 * @name GET /locationall
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Array<Object>} The list of all locations
 */
// GET ALL
router.get("/locationall",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.getAllLocationsController.execute(req, res);
  })
);

/**
 * Route to update an existing location
 * @name PUT /location/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The location ID
 * @param {Object} req.body - The request body with updated location details
 * @returns {Object} The updated location object
 */
// UPDATE
router.put("/location/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.updateLocation),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.updateLocationController.execute(req, res);
  })
);
/**
 * Route to delete a location
 * @name DELETE /del/location/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The location ID
 * @returns {Object} Confirmation of deletion
 */
// DELETE
router.delete("/del/location/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.deleteLocationByIdController.execute(req, res);
  })
);
/**
 * Route to create a new specialization
 * @name POST /specialization
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {Object} req.body - The request body
 * @returns {Object} The created specialization object
 */

// CREATE
router.post("/specialization",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.createSpecialization),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.postSpecializationController.execute(req, res);
  })
);
/**
 * Route to get all specializations
 * @name GET /specializationall
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Array<Object>} The list of all specializations
 */
// GET ALL
router.get("/specializationall",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.getAllSpecializationsController.execute(req, res);
  })
);
/**
 * Route to update an existing specialization
 * @name PUT /specialization/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The specialization ID
 * @param {Object} req.body - The request body with updated specialization details
 * @returns {Object} The updated specialization object
 */
// UPDATE
router.put("/specialization/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.updateSpecialization),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.updateSpecializationController.execute(req, res);
  })
);
/**
 * Route to delete a specialization
 * @name DELETE /del/specialization/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The specialization ID
 * @returns {Object} Confirmation of deletion
 */
// DELETE
router.delete("/del/specialization/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.deleteSpecializationByIdController.execute(req, res);
  })
);

router.get("/get/historymachines",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.getMachineHistoryController.execute(req, res);
  })
);


/**
 * Route to fetch machine inward and outward history
 * @name GET /machine-inout-history
 * @function
 * @memberof module:routers/v8/machines/history
 * @returns {Array} Machine entry and exit records
 */

router.get("/machineinouthistory",authMiddleware,loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.getwerahouseController.execute(req, res);
  })
);


/**
 * Route to get all reasons
 * @name GET /reasons
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Object[]} List of all reasons
 */
// GET ALL
router.get("/reasons",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.getReasonsController.execute(req, res);
  })
);
/**
 * Route to create a new reason
 * @name POST /add/reason
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.body.reason - The reason name
 * @returns {Object} Confirmation of creation
 */
// POST
router.post("/add/reason",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.createReasonController.execute(req, res);
  })
);
/**
 * Route to update a reason
 * @name PUT /upd/reason/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The reason ID
 * @param {String} req.body.reason - Updated reason name
 * @returns {Object} Confirmation of update
 */
// PUT
router.put("/upd/reason/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.updateReasonController.execute(req, res);
  })
);
/**
 * Route to delete a reason
 * @name DELETE /del/reason/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The reason ID
 * @returns {Object} Confirmation of deletion
 */
// DELETE
router.delete("/del/reason/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.deleteReasonController.execute(req, res);
  })
);

/**
 * Route to get all details
 * @name GET /details
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Object[]} List of all details
 */
router.get("/details", authMiddleware, roleMiddleware(["ADMIN"]), loggerMiddleware, asyncMiddleware(async (req, res) => {
  return await machinesdatacontrollers.getDetailsController.execute(req, res);
}));

/**
 * Route to create a detail
 * @name POST /add/detail
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.body.details - Detail text
 * @returns {Object} Confirmation of creation
 */
router.post("/add/detail", authMiddleware, roleMiddleware(["ADMIN"]), loggerMiddleware, asyncMiddleware(async (req, res) => {
  return await machinesdatacontrollers.createDetailController.execute(req, res);
}));

/**
 * Route to update a detail
 * @name PUT /upd/detail/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The detail ID
 * @param {String} req.body.details - Updated detail
 * @returns {Object} Confirmation of update
 */
router.put("/upd/detail/:id", authMiddleware, roleMiddleware(["ADMIN"]), loggerMiddleware, asyncMiddleware(async (req, res) => {
  return await machinesdatacontrollers.updateDetailController.execute(req, res);
}));

/**
 * Route to delete a detail
 * @name DELETE /del/detail/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The detail ID
 * @returns {Object} Confirmation of deletion
 */
router.delete("/del/detail/:id", authMiddleware, roleMiddleware(["ADMIN"]), loggerMiddleware, asyncMiddleware(async (req, res) => {
  return await machinesdatacontrollers.deleteDetailController.execute(req, res);
}));

/**
 * Route to create a task
 * @name POST /addtasks
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {Object} req.body - Task details
 * @returns {Object} Created task response
 */
router.post("/addtasks",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.createTask),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.postTaskController.execute(req, res);
  })
);

/**
 * Route to get all tasks
 * @name GET /gettasks
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Object[]} List of all tasks
 */
router.get("/gettasks",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.getAllTasksController.execute(req, res);
  })
);

/**
 * Route to update a task
 * @name PUT /updatetasks/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The task ID
 * @param {Object} req.body - Updated task details
 * @returns {Object} Confirmation of update
 */
router.put("/updatetasks/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.updateTask),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.updateTaskController.execute(req, res);
  })
);

/**
 * Route to delete a task
 * @name DELETE /deletetasks/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - The task ID
 * @returns {Object} Confirmation of deletion
 */
router.delete("/deletetasks/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.deleteTask),asyncMiddleware(async (req, res) => {
    return await machinesdatacontrollers.deleteTaskController.execute(req, res);
  })
);

module.exports = router;
module.exports = router;
