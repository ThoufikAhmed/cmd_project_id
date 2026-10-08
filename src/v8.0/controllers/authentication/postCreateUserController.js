// auth/controllers/CreateUserController.js

const logger = require("../../../utils/logger");
const bcrypt = require("bcryptjs");

class PostCreateUserController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  hashPassword(plain) {
    return bcrypt.hash(plain, 10);
  }

  async execute(req, res) {
    try {
      const {
        name,
        contact,
        designation,
        location_id,
        user_type,
        username,
        password,
      } = req.body;
      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      // Validate required fields
      if (!name || !username || !password || !user_type) {
        metaLogger.error("Missing required fields");
        return res.status(400).json({
          message: "Name, username, password, and user_type are required",
        });
      }

      // Check if username already exists
      metaLogger.info("Checking if username exists…");
      const existingUser = await this.authRepository.getAuthUserByUsername(
        username
      );

      if (existingUser) {
        metaLogger.error("Username already exists");
        return res.status(409).json({
          message: "Username already exists",
        });
      }

      metaLogger.info("Creating user…");

      // Hash password
      const hashed = await this.hashPassword(password);

      // Insert user
      const user = await this.authRepository.insertUser(
        name,
        contact,
        designation,
        location_id,
        user_type
      );

      // Insert auth user
      await this.authRepository.insertAuthUser(
        user.insertId,
        username,
        hashed,
        user_type
      );

      metaLogger.info("User created successfully");

      return res.status(201).json({
        message: "User created successfully",
        user_id: user.insertId,
        username: username,
      });
    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );
      metaLogger.error(`Create user error: ${error.message}`);

      return res.status(500).json({
        message: "An error occurred while creating user",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = PostCreateUserController;
