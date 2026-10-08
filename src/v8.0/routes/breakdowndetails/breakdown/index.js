/**
 * Express router for authentication routes
 * @module routers/v8/breakdowndetials/breakdown
 */

const express = require("express");
const router = express.Router();

const asyncMiddleware = require("../../../../middleware/async");
const validationMiddleware = require("../../../../middleware/validationMiddleware");
const validation = require("../../../validation/authentication/validate.authentication.auth");
const breakdownController = require("../../../controllers/breakdowndetials");
const loggerMiddleware = require("../../../../middleware/loggerMiddleware");

const authMiddleware = require("../../../../middleware/authMiddlewares");
const roleMiddleware = require("../../../../middleware/ruleMiddleware");

/**
 * Route to fetch all breakdown tickets
 * @name GET /tickets
 * @function
 * @memberof module:routers/v8/breakdown/breakdown
 * @returns {Array} List of breakdown tickets
 */
router.get("/tickets",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await breakdownController.getBreakdownTicketDetailsController.execute(req, res);
  })
);

/**
 * Route to fetch attended and completed tickets
 * @name GET /attended-completed-tickets
 * @function
 * @memberof module:routers/v8/breakdown/breakdown
 * @returns {Array} Attended and completed ticket details
 */
router.get("/attended-completed-tickets",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await breakdownController.getcompletdandattendedticketsController.execute(req, res);
  })
);

/**
 * Route to fetch not attended tickets
 * @name GET /not-attended-tickets
 * @function
 * @memberof module:routers/v8/breakdown/breakdown
 * @returns {Array} Not attended tickets list
 */
router.get("/not-attended-tickets",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await breakdownController.getNotAttendedTicketsController.execute(req, res);
  })
);

/**
 * Route to fetch pending tickets
 * @name GET /pending-tickets
 * @function
 * @memberof module:routers/v8/breakdown/breakdown
 * @returns {Array} Pending tickets list
 */
router.get("/pending-tickets",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await breakdownController.getPendingTicketsController.execute(req, res);
  })
);

/**
 * Route to fetch user device tokens
 * @name GET /user-device-tokens
 * @function
 * @memberof module:routers/v8/breakdown/breakdown
 * @returns {Array} User device tokens
 */
router.get("/user-device-tokens",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await breakdownController.getUserDeviceTokensController.execute(req, res);
  })
);

/**
 * Route to assign a ticket
 * @name POST /assign-ticket
 * @function
 * @memberof module:routers/v8/breakdown/breakdown
 * @param {Object} req.body - Ticket assignment details
 * @returns {Object} Assignment result
 */
router.post("/assign-ticket",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
 return await breakdownController.postAssignTicketController.execute(req, res);
  })
);
module.exports = router
