const logger = require("../../../utils/logger");

class UpdateMachineController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {

      const { id } = req.params;
      const data = req.body;

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info(`Updating machine with ID: ${id}`);

      const result =
        await this.machinesdataRepository.updateMachineById(id, data);

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Machine not found",
        });
      }

      metaLogger.info("Machine updated successfully");

      return res.status(200).json({
        message: "Machine updated successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Update machine error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to update machine",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = UpdateMachineController;