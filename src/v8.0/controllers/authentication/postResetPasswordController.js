// auth/controllers/ResetPasswordController.js
const logger = require("../../../utils/logger");
const bcrypt = require("bcryptjs");

class PostResetPasswordController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  // Hash password
  hashPassword(plain) {
    return bcrypt.hash(plain, 10);
  }

  async execute(req, res) {
    try {
      const { resetToken, newPassword } = req.body;
      const ip = req.ip;
      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      // Validate inputs
      if (!resetToken || !newPassword) {
        metaLogger.error("Missing resetToken or newPassword");
        return res.status(400).json({
          message: "Reset token and new password are required",
        });
      }

      // Validate password strength
      if (newPassword.length < 6) {
        metaLogger.error("Password too short");
        return res.status(400).json({
          message: "Password must be at least 6 characters long",
        });
      }

      metaLogger.info("Processing password reset request...");

      // Find valid reset token from cmd_auth_tokens (where device_info = 'PASSWORD_RESET')
      const resetRequest = await this.authRepository.getPasswordResetToken(
        resetToken
      );

      if (!resetRequest) {
        metaLogger.error("Invalid or expired reset token");
        return res.status(400).json({
          message: "Invalid or expired reset token",
        });
      }

      // Additional expiry check (already filtered in query, but double-check)
      const now = new Date();
      const expiryDate = new Date(resetRequest.expires_at);

      if (now > expiryDate) {
        metaLogger.error(
          `Reset token expired. Expiry: ${expiryDate}, Now: ${now}`
        );

        // Delete expired token
        await this.authRepository.deletePasswordResetToken(resetToken);

        return res.status(400).json({
          message: "Reset token has expired. Please request a new one.",
        });
      }

      const userId = resetRequest.user_id;

      metaLogger.info(`Resetting password for user ID: ${userId}`);

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password in cmd_auth_users
      await this.authRepository.updatePassword(userId, hashedPassword);

      // Delete the used reset token
      await this.authRepository.deletePasswordResetToken(resetToken);

      // Delete all active sessions (force re-login for security)
      // Only delete refresh token sessions, not password reset tokens
      const deleteSessionsQuery = `
        DELETE FROM cmd_auth_tokens
        WHERE user_id = ? AND device_info != 'PASSWORD_RESET';
      `;
      await this.authRepository.deleteAllSessionsByUserId(userId);

      // Clear refresh token from cmd_auth_users
      await this.authRepository.clearRefreshToken(userId);

      // Log password reset success in cmd_auth_logs
      await this.authRepository.insertPasswordResetLog(
        userId,
        "PASSWORD_RESET_SUCCESS",
        ip
      );

      metaLogger.info("Password reset successful. All sessions terminated.");

      return res.status(200).json({
        message:
          "Password reset successful. Please login with your new password.",
        note: "All existing sessions have been terminated for security",
      });
    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );
      metaLogger.error(`Reset password error: ${error.message}`);

      return res.status(500).json({
        message: "An error occurred while resetting your password",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = PostResetPasswordController;
