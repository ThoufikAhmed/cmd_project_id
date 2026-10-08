
/**
 * Express router for authentication routes
 * @module routers/v8/authentication/auths
 */

const express = require("express");
const router = express.Router();

const asyncMiddleware = require("../../../../middleware/async");
const validationMiddleware = require("../../../../middleware/validationMiddleware");
const validation = require("../../../validation/authentication/validate.authentication.auth");
const authenticationController = require("../../../controllers/authentication");
const loggerMiddleware = require("../../../../middleware/loggerMiddleware");

const authMiddleware = require("../../../../middleware/authMiddlewares");
const roleMiddleware = require("../../../../middleware/ruleMiddleware");

// ======================= CREATE USER ===========================
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  loggerMiddleware,
  validationMiddleware(validation.createUser),
  asyncMiddleware(async (req, res) => {
    console.log('loggerMiddleware');
    return await authenticationController.postCreateUserController.execute(req, res);
  })
);

// ======================= LOGIN ================================
router.post(
  "/login",
  loggerMiddleware,
  validationMiddleware(validation.login),
  asyncMiddleware(async (req, res) => {
    console.log('loggerMiddleware');
    return await authenticationController.postLoginController.execute(req, res);
  })
);

// ======================= REFRESH TOKEN =========================
router.post(
  "/refresh",
  loggerMiddleware,
  validationMiddleware(validation.refresh),
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postRefreshController.execute(req, res);
  })
);

// ======================= LOGOUT ===============================
router.post(
  "/logout",
  loggerMiddleware,
  validationMiddleware(validation.logout),
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postLogoutController.execute(req, res);
  })
);

// ======================= LOGOUT ALL ============================
router.post(
  "/logout-all",
  loggerMiddleware,
  validationMiddleware(validation.logoutAll),
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postLogoutAllController.execute(req, res);
  })
);



router.post(
  "/admin/logout-user",
  authMiddleware,
  roleMiddleware(["ADMIN"]),  // Only admins can access
  loggerMiddleware,
  validationMiddleware(validation.adminLogoutUser),
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postAdminLogoutUserController.execute(req, res);
  })
);

// Admin: Logout ALL users (nuclear option)
router.post(
  "/admin/logout-all-users",
  authMiddleware,
  roleMiddleware(["ADMIN"]),  // Only admins can access
  loggerMiddleware,
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postAdminLogoutAllUsersController.execute(req, res);
  })
);

// ======================= DEVICE TOKEN (PUSH) ===================
router.post(
  '/device-token',
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.saveDeviceToken),
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postSaveDeviceTokenController.execute(req, res)
  })
)

router.delete(
  '/device-token',
  authMiddleware,
  loggerMiddleware,
  validationMiddleware(validation.removeDeviceToken),
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postDeleteDeviceTokenController.execute(req, res)
  })
)




// routes/authRoutes.js

// Forgot Password (Public - no auth needed)
router.post(
  "/forgot-password",
  loggerMiddleware,
  validationMiddleware(validation.forgotPassword),
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postForgotPasswordController.execute(req, res);
  })
);

// Reset Password (Public - no auth needed, uses token)
router.post(
  "/reset-password",
  loggerMiddleware,
  validationMiddleware(validation.resetPassword),
  asyncMiddleware(async (req, res) => {
    return await authenticationController.postResetPasswordController.execute(req, res);
  })
);




/**
 * Route to get all users (Admin only)
 * @name GET /users
 * @function
 * @memberof module:routers/v8/authentication/auths
 * @returns {Array} List of users
 */
router.get("/users",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,asyncMiddleware(async (req, res) => {
    return await authenticationController.getAllUsersController.execute(req, res);
  })
);


/**
 * Route to update user details
 * @name PUT /users/:id
 * @function
 * @memberof module:routers/v8/authentication/auths
 * @param {String} req.params.id - User ID
 * @param {Object} req.body - Updated user data
 * @returns {Object} Updated user details
 */
router.put("/users/:id",authMiddleware,roleMiddleware(["ADMIN"]),loggerMiddleware,validationMiddleware(validation.updateUser),asyncMiddleware(async (req, res) => {
    return await authenticationController.updateUserController.execute(req, res);
  })
);

module.exports = router;
