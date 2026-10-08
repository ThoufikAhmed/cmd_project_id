const logger = require("../../../utils/logger");

class CreateDetailController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    const { details } = req.body;

    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info(`Creating detail: ${details}`);

      if (!details) {
        return res.status(400).json({
          message: "Details is required",
        });
      }

      await this.machinesdataRepository.createDetail(details);

      metaLogger.info("Detail created successfully");

      return res.status(201).json({
        message: "Detail created successfully",
      });

    } catch (error) {
      metaLogger.error(`Create detail error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to create detail",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = CreateDetailController;