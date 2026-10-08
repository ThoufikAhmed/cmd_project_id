// auth/controllers/ForgotPasswordController.js
const logger = require("../../../utils/logger");
const crypto = require("crypto");

class PostForgotPasswordController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  // Generate secure random token
  generateResetToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  // Token expires in 1 hour
  getTokenExpiry() {
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  async execute(req, res) {
    try {
      const { username } = req.body;
      const ip = req.ip;
      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      // Validate username
      if (!username) {
        metaLogger.error("No username provided");
        return res.status(400).json({
          message: "Username is required",
        });
      }

      metaLogger.info(`Password reset requested for username: ${username}`);

      // Check if user exists
      const authUser = await this.authRepository.getAuthUserByUsername(
        username
      );

      // SECURITY: Always return success even if user doesn't exist
      // This prevents attackers from discovering valid usernames
      if (!authUser) {
        metaLogger.warn(
          `Password reset requested for non-existent user: ${username}`
        );

        // Still return success to prevent username enumeration
        return res.status(200).json({
          message:
            "If your username exists, you will receive a password reset token",
        });
      }

      // Delete any existing reset tokens for this user
      await this.authRepository.deletePasswordResetTokensByUserId(authUser.id);

      // Generate reset token
      const resetToken = this.generateResetToken();
      const tokenExpiry = this.getTokenExpiry();

      metaLogger.info(`Generated reset token for user ID: ${authUser.id}`);

      // Save token to cmd_auth_tokens table with device_info = 'PASSWORD_RESET'
      await this.authRepository.savePasswordResetToken(
        authUser.id,
        resetToken,
        tokenExpiry
      );

      // Log password reset request in cmd_auth_logs
      await this.authRepository.insertPasswordResetLog(
        authUser.id,
        "PASSWORD_RESET_REQUESTED",
        ip
      );

      metaLogger.info("Password reset token saved successfully");

      // TODO: In production, send this token via email/SMS
      // For now, we'll return it in the response for testing
      // REMOVE THIS IN PRODUCTION!
      const responseData = {
        message:
          "If your username exists, you will receive a password reset token",
      };

      // Only include token in development
      if (process.env.NODE_ENV === "development") {
        responseData.resetToken = resetToken;
        responseData.expiresAt = tokenExpiry;
        responseData.note =
          "Token is only shown in development mode. In production, this will be sent via email.";
      }

      return res.status(200).json(responseData);
    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );
      metaLogger.error(`Forgot password error: ${error.message}`);

      return res.status(500).json({
        message: "An error occurred while processing your request",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = PostForgotPasswordController;
