// // auth/controllers/LoginController.js
const logger = require("../../../utils/logger");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

class PostLoginController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  // Internal service logic methods
  hashPassword(plain) {
    return bcrypt.hash(plain, 10);
  }

  validatePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  generateAccess(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  }

  generateRefresh(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  }

  verifyRefresh(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  }

  refreshExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  async execute(req, res) {
    try {
      // Extract request data
      const { username, password, device_info } = req.body;
      const ip = req.ip;
      const {
        locals: { requestId },
      } = res;

      // Initialize logger with metadata
      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      // Validate required fields
      if (!username || !password) {
        metaLogger.error("Missing username or password");
        return res.status(400).json({
          message: "Username and password are required",
        });
      }

      // Authenticate user
      metaLogger.info("Authenticating user…");
      const authUser = await this.authRepository.getAuthUserByUsername(
        username
      );

      if (!authUser) {
        await this.authRepository.insertAuthLog(
          null,
          ip,
          device_info,
          "FAILED"
        );
        metaLogger.error("User not found");
        return res.status(400).json({
          message: "Invalid username or password",
        });
      }

      // Validate password
      const valid = await this.validatePassword(
        password,
        authUser.password_hash
      );

      if (!valid) {
        await this.authRepository.insertAuthLog(
          authUser.user_id,
          ip,
          device_info,
          "FAILED"
        );
        metaLogger.error("Invalid password");
        return res.status(400).json({
          message: "Invalid username or password",
        });
      }

      // Create JWT payload
      const payload = {
        id: authUser.user_id,
        role: authUser.auth_role,
        username: authUser.username,
      };

      // Generate tokens
      const accessToken = this.generateAccess(payload);
      const refreshToken = this.generateRefresh(payload);
      const expiry = this.refreshExpiry();

      // Save session and update tokens
      await this.authRepository.saveSession(
        authUser.user_id,
        refreshToken,
        expiry,
        device_info
      );
      await this.authRepository.updateRefreshTokenOnUser(
        authUser.user_id,
        refreshToken
      );
      await this.authRepository.insertAuthLog(
        authUser.user_id,
        ip,
        device_info,
        "SUCCESS"
      );

      metaLogger.info("Login successful");

      return res.status(200).json({
        accessToken,
        refreshToken,
        user: payload,
      });
    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );
      metaLogger.error(`Login error: ${error.message}`);

      return res.status(500).json({
        message: "An error occurred during login",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = PostLoginController;
