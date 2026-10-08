const logger = require("../../../utils/logger");

class DeleteMachineController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {

      const { id } = req.params;

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info(`Deleting machine with ID: ${id}`);

      const result =
        await this.machinesdataRepository.deleteMachineById(id);

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Machine not found",
        });
      }

      metaLogger.info("Machine deleted successfully");

      return res.status(200).json({
        message: "Machine deleted successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Delete machine error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to delete machine",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = DeleteMachineController;
