const logger = require("../../../utils/logger");

class UpdateReasonController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    const { id } = req.params;
    const { reason } = req.body;

    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info(`Updating reason with ID: ${id}`);

      const result = await this.machinesdataRepository.updateReasonById(id, reason);

      if (!result.affectedRows) {
        metaLogger.warn(`Reason not found for ID: ${id}`);

        return res.status(404).json({
          message: "Reason not found",
        });
      }

      metaLogger.info("Reason updated successfully");

      return res.status(200).json({
        message: "Reason updated successfully",
      });

    } catch (error) {
      metaLogger.error(`Update reason error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to update reason",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = UpdateReasonController;