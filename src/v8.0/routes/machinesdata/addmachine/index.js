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
 * Route to create a machine
 * @name POST /cerate/machine
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {Object} req.body - Machine details
 * @returns {Object} Created machine response
 */
router.post("/cerate/machine",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.createMachine),asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.postaddMachineController.execute(req, res);
  })
);

/**
 * Route to get all machines
 * @name GET /getaddmachine
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @returns {Array} List of machines
 */
router.get("/getaddmachine",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.getAlladdMachinesController.execute(req, res);
  })
);

/**
 * Route to get multiple machines by IDs
 * @name POST /multipl/emachine
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {Object} req.body - Array of machine IDs
 * @returns {Array} Machines matching given IDs
 */
router.post("/multipl/emachine",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.getMachinesByIds),asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.getMachinesByIdsController.execute(req, res);
  })
);

/**
 * Route to update a machine
 * @name PUT /addmachine/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - Machine ID
 * @param {Object} req.body - Updated machine details
 * @returns {Object} Confirmation of update
 */
router.put("/addmachine/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.updateMachine),
asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.updateMachineController.execute(req, res);
  })
);

/**
 * Route to delete a machine
 * @name DELETE /del/addmachine/:id
 * @function
 * @memberof module:routers/v8/machinesdata/data
 * @param {String} req.params.id - Machine ID
 * @returns {Object} Confirmation of deletion
 */
router.delete("/del/addmachine/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.deleteMachine),asyncMiddleware(async (req, res) => {
    return machinesdatacontrollers.deleteMachineController.execute(req, res);
  })
);


module.exports = router;
