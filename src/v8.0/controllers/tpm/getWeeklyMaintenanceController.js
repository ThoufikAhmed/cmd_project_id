const logger = require("../../../utils/logger");

class GetWeeklyMaintenanceController {
  constructor(tpmhistoryRepository) {
    this.tpmhistoryRepository = tpmhistoryRepository;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info("Fetching WEEKLY maintenance data");

      const data = await this.tpmhistoryRepository.getWeeklyMaintenance();

      return res.status(200).json({
        message: "Weekly maintenance fetched successfully",
        data,
      });

    } catch (error) {
      metaLogger.error(`Weekly maintenance error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch weekly maintenance",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = GetWeeklyMaintenanceController;