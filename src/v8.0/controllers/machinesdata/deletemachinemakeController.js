const logger = require("../../../utils/logger");

class DeleteMachineMakeController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;

      const { locals: { requestId } } = res;
      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      metaLogger.info("Deleting machine make...");

      const machineMakeId = parseInt(id, 10);

      if (isNaN(machineMakeId)) {
        return res.status(400).json({
          message: "Invalid machine make id",
        });
      }

      const result =
        await this.machinesdataRepository.deleteMachineMake(machineMakeId);
     

      if (result.affectedRows === 0) {
        metaLogger.warn("Machine make not found");

        return res.status(404).json({
          message: "Machine make not found",
        });
      }

      metaLogger.info("Machine make deleted successfully");

      return res.status(200).json({
        message: "Machine make deleted successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Delete machine make error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to delete machine make",
        error: process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
      });
    }
  }
}

module.exports = DeleteMachineMakeController;
