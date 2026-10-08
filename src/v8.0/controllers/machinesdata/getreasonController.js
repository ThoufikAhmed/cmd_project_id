const logger = require("../../../utils/logger");

class GetReasonsController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info("Fetching all reasons");

      const data = await this.machinesdataRepository.getAllReasons();

      metaLogger.info(`Fetched ${data.length} reasons`);

      return res.status(200).json({
        data,
      });

    } catch (error) {
      metaLogger.error(`Get reasons error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch reasons",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = GetReasonsController;