const logger = require("../../../utils/logger");

class PostMachineMakeController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { make_name } = req.body;

      const { locals: { requestId } } = res;
      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      metaLogger.info("Creating machine make...");

      if (!make_name) {
        return res.status(400).json({
          message: "Machine make name is required",
        });
      }

      const machineMakeName = make_name.toString().trim();

      await this.machinesdataRepository.insertMachineMake(machineMakeName);

      metaLogger.info("Machine make created successfully");

      return res.status(201).json({
        message: "Machine make created successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Create machine make error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to create machine make",
        error: process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
      });
    }
  }
}

module.exports = PostMachineMakeController;
