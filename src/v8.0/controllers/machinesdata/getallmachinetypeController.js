const logger = require("../../../utils/logger");

class GetAllMachineTypesController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Fetching all machine types...");

      const result =
        await this.machinesdataRepository.getAllMachineTypes();

      metaLogger.info("Machine types fetched successfully");

      return res.status(200).json({
        message: "Machine types fetched successfully",
        data: result,
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Get machine types error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch machine types",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = GetAllMachineTypesController;
