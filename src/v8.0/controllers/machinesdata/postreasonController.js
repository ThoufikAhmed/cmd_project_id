const logger = require("../../../utils/logger");

class CreateReasonController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    const { reason } = req.body;

    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info(`Creating reason: ${reason}`);

      if (!reason) {
        metaLogger.warn("Reason is missing in request");

        return res.status(400).json({
          message: "Reason is required",
        });
      }

      await this.machinesdataRepository.createReason(reason);

      metaLogger.info("Reason created successfully");

      return res.status(201).json({
        message: "Reason created successfully",
      });

    } catch (error) {
      metaLogger.error(`Create reason error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to create reason",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = CreateReasonController;