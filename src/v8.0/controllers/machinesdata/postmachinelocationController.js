const logger = require("../../../utils/logger");

class PostLocationController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { location_name } = req.body;

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Creating location...");

      if (!location_name) {
        return res.status(400).json({
          message: "Location name is required",
        });
      }

      const locationName = location_name.toString().trim();

      await this.machinesdataRepository.insertLocation(locationName);

      metaLogger.info("Location created successfully");

      return res.status(201).json({
        message: "Location created successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Create location error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to create location",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = PostLocationController;
