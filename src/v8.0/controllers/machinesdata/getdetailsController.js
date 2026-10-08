const logger = require("../../../utils/logger");

class GetDetailsController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info("Fetching all details");

      const data = await this.machinesdataRepository.getAllDetails();

      metaLogger.info(`Fetched ${data.length} records`);

      return res.status(200).json({ data });

    } catch (error) {
      metaLogger.error(`Get details error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch details",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = GetDetailsController;