// auth/controllers/LogoutController.js
const logger = require("../../../utils/logger");

class PostLogoutController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(req, res) {
    try {
      const { refreshToken } = req.body;
      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      metaLogger.info("Processing logout...");

      // Validate refresh token presence
      if (!refreshToken) {
        metaLogger.error("No refresh token provided");
        return res.status(400).json({
          message: "Refresh token is required for logout",
        });
      }

      // Check if session exists
      const session = await this.authRepository.getSessionByToken(refreshToken);

      if (!session) {
        metaLogger.info("Session not found - user already logged out");
        return res.status(200).json({
          message: "Already logged out",
        });
      }

      metaLogger.info(`Logging out user ID: ${session.user_id}`);

      // Delete the session
      await this.authRepository.deleteSessionById(session.id);

      // Clear refresh token from user table if it matches
      await this.authRepository.clearRefreshTokenIfMatches(
        session.user_id,
        refreshToken
      );

      // Log the logout event
      await this.authRepository.insertLogoutLog(session.user_id);

      metaLogger.info("Logout successful");

      return res.status(200).json({
        message: "Logged out successfully",
      });
    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );
      metaLogger.error(`Logout error: ${error.message}`);

      return res.status(500).json({
        message: "An error occurred during logout",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = PostLogoutController;
