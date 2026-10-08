const logger = require("../../../utils/logger");

class DeleteDetailController {
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
      metaLogger.info(`Deleting detail with ID: ${id}`);

      const result = await this.machinesdataRepository.deleteDetailById(id);

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Detail not found",
        });
      }

      metaLogger.info("Detail deleted successfully");

      return res.status(200).json({
        message: "Detail deleted successfully",
      });

    } catch (error) {
      metaLogger.error(`Delete detail error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to delete detail",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = DeleteDetailController;