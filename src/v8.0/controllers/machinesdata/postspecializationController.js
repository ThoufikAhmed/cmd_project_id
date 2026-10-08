const logger = require("../../../utils/logger");

class PostSpecializationController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { specialization } = req.body;

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Creating specialization...");

      if (!specialization) {
        return res.status(400).json({
          message: "Specialization is required",
        });
      }

      const specializationName = specialization.toString().trim();

      await this.machinesdataRepository.insertSpecialization(
        specializationName
      );

      metaLogger.info("Specialization created successfully");

      return res.status(201).json({
        message: "Specialization created successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Create specialization error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to create specialization",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = PostSpecializationController;
