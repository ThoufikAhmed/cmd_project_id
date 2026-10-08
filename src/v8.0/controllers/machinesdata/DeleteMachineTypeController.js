const logger = require("../../../utils/logger");

class DeleteMachineTypeController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;

      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(
        requestId,
        req.originalUrl
      );

      metaLogger.info("Deleting machine type...");

      if (!id) {
        return res.status(400).json({
          message: "Machine type id is required",
        });
      }

      const result =
        await this.machinesdataRepository.deleteMachineTypeById(id);

      if (result.affectedRows === 0) {
        metaLogger.warn("Machine type not found");

        return res.status(404).json({
          message: "Machine type not found",
        });
      }

      metaLogger.info("Machine type deleted successfully");

      return res.status(200).json({
        message: "Machine type deleted successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Delete machine type error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to delete machine type",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = DeleteMachineTypeController;
