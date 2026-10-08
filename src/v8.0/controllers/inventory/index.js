
const PostMachineController = require('./postMachineController')
const PostBreakdownRaiseTicketController = require('./postBreakdownRaiseTicketController')
const GetAllIssueTypesController = require('./getAllIssueTypesController')
const GetAllMachinesController = require('./getAllMachinesController')
const GetBreakdownAttendTicketController = require('./getBreakdownAttendTicketController')
const PostAttendTicketController = require('./postAttendTicketController')
const GetTpmTasksController = require('./getTpmTasksController')
const PostSubmitTpmMaintenanceController = require('./postsubmitTpmMaintenanceController')
const GetTpmSummaryController = require('./getTpmSummaryController')
const GetTpmHistoryController = require('./getTpmHistoryController')
const GetScanMachineController = require('./getScanMachineDetailsController')
const GetMachineTypesController = require('./getMachineTypesController')
const GetMachineMakesController = require('./getMachineMakesController')
const PostMachineTypeController = require('./postMachineTypeController')
const PostMachineMakeController = require('./postMachineMakeController')
const GetMachineByBarcodeController = require('./getMachineByBarcodeController')
const PostCreateMachineMovementInwardOutwardController = require('./postcreateMachineMovementinwardoutwardController')
const PostFactoryMovementController = require('./postFactoryMovementController')
const GetFactoryListController = require('./getFactoryListController')
const GetSpecializationsController = require('./getSpecializationsController')
const PostAcceptTicketController = require('./postAcceptTicketController')
const HuggingFaceController = require('./postHuggingFaceController')
const PostTpmMaintenanceTasksController = require('./postTpmMaintenanceTasksController')
const GetNotificationsController = require('./getNotificationsController')





const inventoryRepository = require('../../../models/inventory/repository/cmd')



const postMachineController = new PostMachineController(inventoryRepository)
const postBreakdownRaiseTicketController = new PostBreakdownRaiseTicketController(inventoryRepository)
const getAllIssueTypesController = new GetAllIssueTypesController(inventoryRepository)
const getAllMachinesController = new GetAllMachinesController(inventoryRepository)
const postAttendTicketController = new PostAttendTicketController(inventoryRepository)
const getBreakdownAttendTicketController = new GetBreakdownAttendTicketController(inventoryRepository)
const getTpmTasksController = new GetTpmTasksController(inventoryRepository)
const postSubmitTpmMaintenanceController = new PostSubmitTpmMaintenanceController(inventoryRepository)
const getTpmSummaryController = new GetTpmSummaryController(inventoryRepository)
const getTpmHistoryController = new GetTpmHistoryController(inventoryRepository)
const getScanMachineController = new GetScanMachineController(inventoryRepository)
const getMachineTypesController = new GetMachineTypesController(inventoryRepository)
const getMachineMakesController = new GetMachineMakesController(inventoryRepository)
const postMachineTypeController = new PostMachineTypeController(inventoryRepository)
const postMachineMakeController = new PostMachineMakeController(inventoryRepository)
const getMachineByBarcodeController = new GetMachineByBarcodeController(inventoryRepository)
const postCreateMachineMovementInwardOutwardController = new PostCreateMachineMovementInwardOutwardController(inventoryRepository)
const postFactoryMovementController = new PostFactoryMovementController(inventoryRepository)
const getFactoryListController = new GetFactoryListController(inventoryRepository)
const getSpecializationsController = new GetSpecializationsController(inventoryRepository)
const postAcceptTicketController = new PostAcceptTicketController(inventoryRepository)
const postHuggingFaceController = new HuggingFaceController(inventoryRepository)
const postTpmMaintenanceTasksController = new PostTpmMaintenanceTasksController(inventoryRepository)
const getNotificationsController = new GetNotificationsController(inventoryRepository)
module.exports = {
  postMachineController,
  postBreakdownRaiseTicketController,
  getAllIssueTypesController,
  getAllMachinesController,
  postAttendTicketController,
  getTpmTasksController,
  postSubmitTpmMaintenanceController,
  getTpmSummaryController,
  getTpmHistoryController,
  getScanMachineController,
  getMachineTypesController,
  getMachineMakesController,
  postMachineTypeController,
  postMachineMakeController,
  getMachineByBarcodeController,
  postCreateMachineMovementInwardOutwardController,
  postFactoryMovementController,
  getFactoryListController,
  getSpecializationsController,
  getBreakdownAttendTicketController,
  postAcceptTicketController,
  postHuggingFaceController,
  postTpmMaintenanceTasksController,
  getNotificationsController
}
