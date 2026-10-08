/**
 * Express router for authentication routes
 * @module routers/v8/tpm/tpmhistory
 */

const express = require("express");
const router = express.Router();

const asyncMiddleware = require("../../../../middleware/async");
const validationMiddleware = require("../../../../middleware/validationMiddleware");
const validation = require("../../../validation/authentication/validate.authentication.auth");
const tpmController = require("../../../controllers/tpm");
const loggerMiddleware = require("../../../../middleware/loggerMiddleware");

const authMiddleware = require("../../../../middleware/authMiddlewares");
const roleMiddleware = require("../../../../middleware/ruleMiddleware");
/**
 * Route to fetch daily TPM maintenance tasks
 * @name GET /tpm/daily
 * @function
 * @memberof module:routers/v8/tpm/tpm
 * @returns {Array} List of daily maintenance tasks
 */
router.get("/tpm/daily",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await tpmController.getDailyMaintenanceController.execute(req, res);
  })
);

/**
 * Route to fetch weekly TPM maintenance tasks
 * @name GET /tpm/weekly
 * @function
 * @memberof module:routers/v8/tpm/tpm
 * @returns {Array} List of weekly maintenance tasks
 */
router.get("/tpm/weekly",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await tpmController.getWeeklyMaintenanceController.execute(req, res);
  })
);

/**
 * Route to fetch monthly TPM maintenance tasks
 * @name GET /tpm/monthly
 * @function
 * @memberof module:routers/v8/tpm/tpm
 * @returns {Array} List of monthly maintenance tasks
 */
router.get("/tpm/monthly",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await tpmController.getMonthlyMaintenanceController.execute(req, res);
  })
);
module.exports = router;