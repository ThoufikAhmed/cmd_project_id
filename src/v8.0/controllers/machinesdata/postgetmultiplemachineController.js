const logger = require("../../../utils/logger");

class GetMachinesByIdsController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {

      const { ids } = req.body;

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Fetching multiple machines...");

      if (!Array.isArray(ids)) {
        return res.status(400).json({
          message: "ids must be an array",
        });
      }

      const machines =
        await this.machinesdataRepository.getMachinesByIds(ids);

      metaLogger.info("Multiple machines fetched successfully");

      return res.status(200).json({
        message: "Machines fetched successfully",
        data: machines,
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Get multiple machines error: ${error.message}`);

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

module.exports = GetMachinesByIdsController;
