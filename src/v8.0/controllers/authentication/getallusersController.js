const logger = require("../../../utils/logger");

class GetAllUsersController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(req, res) {
    try {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Fetching all users...");

      const result = await this.authRepository.getAllUsers();

      metaLogger.info("Users fetched successfully");

      return res.status(200).json({
        message: "Users fetched successfully",
        data: result,
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Get users error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch users",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = GetAllUsersController;
