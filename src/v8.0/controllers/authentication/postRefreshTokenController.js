// auth/controllers/RefreshTokenController.js
const logger = require("../../../utils/logger");
const jwt = require("jsonwebtoken");

class PostRefreshTokenController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  // JWT utility methods
  verifyRefresh(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  }

  generateAccess(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m",
    });
  }

  generateRefresh(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  }

  refreshExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  async execute(req, res) {
    try {
      const { refreshToken, device_info } = req.body;
      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      // Validate refresh token presence
      if (!refreshToken) {
        metaLogger.error("No refresh token provided");
        return res.status(400).json({
          message: "Refresh token is required",
        });
      }

      metaLogger.info("Validating refresh token session...");

      // Check if session exists in database
      const session = await this.authRepository.getSessionByToken(refreshToken);

      if (!session) {
        metaLogger.error("Session not found for refresh token");
        return res.status(401).json({
          message: "Invalid or expired refresh token",
        });
      }

      // Check if session has expired
      if (session.expires_at && new Date(session.expires_at) < new Date()) {
        metaLogger.error("Refresh token session expired");
        await this.authRepository.deleteSessionById(session.id);
        return res.status(401).json({
          message: "Refresh token has expired. Please login again.",
        });
      }

      // Verify JWT signature and expiry
      let payload;
      try {
        payload = this.verifyRefresh(refreshToken);
        metaLogger.info("Refresh token verified successfully");
      } catch (error) {
        metaLogger.error(`Refresh token verification failed: ${error.message}`);

        // Delete invalid session
        await this.authRepository.deleteSessionById(session.id);

        if (error.name === "TokenExpiredError") {
          return res.status(401).json({
            message: "Refresh token expired. Please login again.",
          });
        }

        return res.status(401).json({
          message: "Invalid refresh token",
        });
      }

      // Create new token payload
      const newPayload = {
        id: session.user_id,
        role: payload.role,
        username: payload.username,
      };

      // Generate new tokens
      const newAccessToken = this.generateAccess(newPayload);
      const newRefreshToken = this.generateRefresh(newPayload);
      const expiry = this.refreshExpiry();

      metaLogger.info("Rotating refresh token...");

      // Delete old session and create new one (token rotation)
      await this.authRepository.deleteSessionById(session.id);
      await this.authRepository.saveSession(
        session.user_id,
        newRefreshToken,
        expiry,
        device_info
      );
      await this.authRepository.updateRefreshTokenOnUser(
        session.user_id,
        newRefreshToken
      );

      metaLogger.info("Refresh token rotated successfully");

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        message: "Tokens refreshed successfully",
      });
    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );
      metaLogger.error(`Refresh token error: ${error.message}`);

      return res.status(500).json({
        message: "An error occurred while refreshing token",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = PostRefreshTokenController;
