const logger = require("../../../utils/logger");

class GetAllOrganizationsController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Fetching all organizations...");

      const organizations =
        await this.machinesdataRepository.getAllOrganizations();

      metaLogger.info("Organizations fetched successfully");

      return res.status(200).json({
        message: "Organizations fetched successfully",
        data: organizations,
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Get organizations error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch organizations",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = GetAllOrganizationsController;
