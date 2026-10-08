const logger = require("../../../utils/logger");

class UpdateDetailController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    const { id } = req.params;
    const { details } = req.body;

    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info(`Updating detail with ID: ${id}`);

      const result = await this.machinesdataRepository.updateDetailById(id, details);

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Detail not found",
        });
      }

      metaLogger.info("Detail updated successfully");

      return res.status(200).json({
        message: "Detail updated successfully",
      });

    } catch (error) {
      metaLogger.error(`Update detail error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to update detail",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = UpdateDetailController;