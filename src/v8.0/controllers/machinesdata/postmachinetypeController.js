// machineTypes/controllers/PostMachineTypeController.js

const logger = require("../../../utils/logger");

class PostMachineTypeController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { type_name } = req.body;

      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      metaLogger.info("Creating machine type...");

      // Validation
      if (!type_name) {
        return res.status(400).json({
          message: "Machine type name is required",
        });
      }

      await this.machinesdataRepository.insertMachineType(type_name);
      

      metaLogger.info("Machine type created successfully");

      return res.status(201).json({
        message: "Machine type created successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Insert machine type error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to create machine type",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = PostMachineTypeController;