const GetDailyMaintenanceController = require("./geDailyMaintenanceController");
const GetWeeklyMaintenanceController = require("./getWeeklyMaintenanceController");
const GetMonthlyMaintenanceController = require("./getMontlyMaintenanceController");       


const tpmhistoryRepository = require("../../../models/tpm/repository/tpmhistory");

const getDailyMaintenanceController = new GetDailyMaintenanceController(tpmhistoryRepository);
const getWeeklyMaintenanceController = new GetWeeklyMaintenanceController(tpmhistoryRepository);
const getMonthlyMaintenanceController = new GetMonthlyMaintenanceController(tpmhistoryRepository);



module.exports={
  getDailyMaintenanceController,
  getWeeklyMaintenanceController,
  getMonthlyMaintenanceController
}