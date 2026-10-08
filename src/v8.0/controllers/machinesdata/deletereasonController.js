const logger = require("../../../utils/logger");

class DeleteReasonController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    const { id } = req.params;

    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info(`Deleting reason with ID: ${id}`);

      const result = await this.machinesdataRepository.deleteReasonById(id);

      if (!result.affectedRows) {
        metaLogger.warn(`Reason not found for ID: ${id}`);

        return res.status(404).json({
          message: "Reason not found",
        });
      }

      metaLogger.info("Reason deleted successfully");

      return res.status(200).json({
        message: "Reason deleted successfully",
      });

    } catch (error) {
      metaLogger.error(`Delete reason error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to delete reason",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = DeleteReasonController;