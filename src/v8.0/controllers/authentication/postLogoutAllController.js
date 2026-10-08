// auth/controllers/LogoutAllController.js
const logger = require("../../../utils/logger");

class PostLogoutAllController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(req, res) {
    try {
      // IMPORTANT: Get userId from authenticated user (req.user), NOT from request body
      // This prevents users from logging out other users
      const userId = req.user.id;
      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      metaLogger.info(`Revoking all sessions for user ID: ${userId}...`);

      // Delete all sessions for this user
      const result = await this.authRepository.deleteAllSessionsByUserId(
        userId
      );
      const sessionsDeleted = result.affectedRows || 0;

      // Clear refresh token from user table
      await this.authRepository.clearRefreshToken(userId);

      // Log the logout event
      await this.authRepository.insertLogoutLog(userId);

      metaLogger.info(
        `All sessions cleared. ${sessionsDeleted} session(s) terminated.`
      );

      return res.status(200).json({
        message: "Logged out from all devices successfully",
        sessionsTerminated: sessionsDeleted,
      });
    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );
      metaLogger.error(`Logout all error: ${error.message}`);

      return res.status(500).json({
        message: "An error occurred during logout",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = PostLogoutAllController;
