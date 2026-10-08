const logger = require("../../../utils/logger");

class PostMachineController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const data = req.body;

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Creating machine...");

      if (!data.machine_name) {
        return res.status(400).json({
          message: "Machine name is required",
        });
      }

      // Generate machine_code like 001
      const machines =
        await this.machinesdataRepository.getAllMachines();

      const nextCode =
        String(machines.length + 1).padStart(3, "0");

      data.machine_code = nextCode;

      await this.machinesdataRepository.insertMachine(data);

      metaLogger.info("Machine created successfully");

      return res.status(201).json({
        message: "Machine created successfully",
        machine_code: nextCode,
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Create machine error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to create machine",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = PostMachineController;
