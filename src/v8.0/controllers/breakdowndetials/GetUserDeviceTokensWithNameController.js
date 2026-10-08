const logger = require("../../../utils/logger");

class GetUserDeviceTokensWithNameController {
  constructor(breakdownRepository) {
    this.breakdownRepository = breakdownRepository;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info("Fetching user device tokens with names");

      const data = await this.breakdownRepository.getUserDeviceTokensWithName();

      return res.status(200).json({
        message: "User device tokens with names fetched successfully",
        data,
      });

    } catch (error) {
      metaLogger.error(`Fetch tokens with names error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch user tokens",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = GetUserDeviceTokensWithNameController;