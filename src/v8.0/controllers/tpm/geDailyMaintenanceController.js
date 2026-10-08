const logger = require("../../../utils/logger");

class GetDailyMaintenanceController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info("Fetching DAILY maintenance data");

      const data = await this.machinesdataRepository.getDailyMaintenance();

      console.log("Daily Maintenance Data:", data);

      return res.status(200).json({
        message: "Daily maintenance fetched successfully",
        data,
      });

    } catch (error) {
      metaLogger.error(`Daily maintenance error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch daily maintenance",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = GetDailyMaintenanceController;