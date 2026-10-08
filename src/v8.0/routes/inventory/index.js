console.log('Inventory routes loaded');

const express = require('express')
const router = express.Router()
const asyncMiddleware = require('../../../middleware/async')
const validationMiddleware = require('../../../middleware/validationMiddleware')
const loggerMiddleware = require('../../../middleware/loggerMiddleware')
const authMiddleware = require('../../../middleware/authMiddlewares')
const inventoryController = require('../../controllers/inventory')
const validation = require('../../validation/validate.inventory');
const HuggingFaceController = require('../../controllers/inventory/postHuggingFaceController');

router.post(
  "/inward",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.postInward),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postCreateMachineMovementInwardOutwardController.execute(req, res);
  })
)

router.post(
  "/factory-movement",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.postFactoryMovement),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postFactoryMovementController.execute(req, res);
  })
)

router.get(
  "/factory-list/:location_name",
  loggerMiddleware,
  validationMiddleware(validation.getFactoryList),   
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getFactoryListController.execute(req, res);
  })
)



router.post(
  "/breakdown-raise-ticket",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.postBreakdownRaiseTicket),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postBreakdownRaiseTicketController.execute(req, res);
  })
)

router.get(
  "/breakdown-attend-tickets-all",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.getBreakdownAttendTicket),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getBreakdownAttendTicketController.execute(req, res);
  })
)

router.post(
  "/attend-ticket",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.postAttendTicket),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postAttendTicketController.execute(req, res);
  })
)

router.post(
  "/accept-ticket",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.postAcceptTicket),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postAcceptTicketController.execute(req, res);
  })
)


router.get(
  "/issue-types",
  loggerMiddleware,
  validationMiddleware(validation.getAllIssueTypes),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getAllIssueTypesController.execute(req, res);
  })
)

router.get(
  "/machines/:barcode?",
  loggerMiddleware,
  validationMiddleware(validation.getAllMachines),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getAllMachinesController.execute(req, res);
  })
)

router.post(
  "/machine",
  loggerMiddleware,
  validationMiddleware(validation.postMachine),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postMachineController.execute(req, res);
  })
)

router.get(
  "/tpm/tasks/:type",
  loggerMiddleware,
  validationMiddleware(validation.getTpmTasks),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getTpmTasksController.execute(req, res);
  })
)
router.post(
  "/tpm/submit-maintenance",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.postSubmitTpmMaintenance),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postSubmitTpmMaintenanceController.execute(req, res);
  })
)

router.get(
  "/tpm/summary/:type",
  loggerMiddleware,
  validationMiddleware(validation.getTpmSummary),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getTpmSummaryController.execute(req, res);
  })
)

router.post(
  "/tpm/maintenance-tasks",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.postTpmMaintenanceTasks),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postTpmMaintenanceTasksController.execute(req, res);
  })
)

router.get(
  "/tpm/history/:machineId",
  loggerMiddleware,
  validationMiddleware(validation.getTpmHistory),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getTpmHistoryController.execute(req, res);
  })
)



router.get("/scan-machine/logs/:barcode",
  loggerMiddleware,
  validationMiddleware(validation.getScanMachineDetails),
  asyncMiddleware(async (req, res) => {
  return await inventoryController.getScanMachineController.execute(req, res)
})
)


router.get("/machine-types",
  loggerMiddleware,
  validationMiddleware(validation.getMachineTypes),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getMachineTypesController.execute(req, res)
  })
)
router.get("/machine-makes",
  loggerMiddleware,
  validationMiddleware(validation.getMachineMakes),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getMachineMakesController.execute(req, res)
  })
)

router.post("/machine-type",
  loggerMiddleware,
  validationMiddleware(validation.postMachineType),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postMachineTypeController.execute(req, res)
  })
)

router.post("/machine-make",
  loggerMiddleware,
  validationMiddleware(validation.postMachineMake),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postMachineMakeController.execute(req, res)
  })
)

router.get("/specializations",
  loggerMiddleware,
  validationMiddleware(validation.getSpecializations),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getSpecializationsController.execute(req, res)
  })
)

router.get(
  "/machine/barcode/:barcode",
  loggerMiddleware,
  validationMiddleware(validation.getMachineByBarcode),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getMachineByBarcodeController.execute(req, res)
  })
)


router.get("/notifications/:userId?",
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.getNotifications),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.getNotificationsController.execute(req, res)
  })
)



router.post("/hugging-face",
  loggerMiddleware,
  validationMiddleware(validation.postHuggingFace),
  asyncMiddleware(async (req, res) => {
    return await inventoryController.postHuggingFaceController.execute(req, res)
  })
)


module.exports = router
