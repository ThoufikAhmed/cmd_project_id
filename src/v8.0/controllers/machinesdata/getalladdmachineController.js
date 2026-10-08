const logger = require("../../../utils/logger");

class GetAllMachinesController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Fetching all machines...");

      const machines =
        await this.machinesdataRepository.getAllMachines();

      metaLogger.info("Machines fetched successfully");

      return res.status(200).json({
        message: "Machines fetched successfully",
        data: machines,
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Get machines error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch machines",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = GetAllMachinesController;
