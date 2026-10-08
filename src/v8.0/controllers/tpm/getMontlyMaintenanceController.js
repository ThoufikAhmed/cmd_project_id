const logger = require("../../../utils/logger");

class GetMonthlyMaintenanceController {
  constructor(tpmhistoryRepository) {
    this.tpmhistoryRepository = tpmhistoryRepository;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info("Fetching MONTHLY maintenance data");

      const data = await this.tpmhistoryRepository.getMonthlyMaintenance();

      return res.status(200).json({
        message: "Monthly maintenance fetched successfully",
        data,
      });

    } catch (error) {
      metaLogger.error(`Monthly maintenance error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch monthly maintenance",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = GetMonthlyMaintenanceController;