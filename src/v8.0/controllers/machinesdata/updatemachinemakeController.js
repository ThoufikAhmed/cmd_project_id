const logger = require("../../../utils/logger");

class UpdateMachineMakeController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;
      const { make_name } = req.body;

      const { locals: { requestId } } = res;
      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      metaLogger.info("Updating machine make...");

      if (!id) {
        return res.status(400).json({
          message: "Machine make id is required",
        });
      }

      if (!make_name) {
        return res.status(400).json({
          message: "Machine make name is required",
        });
      }

      const machineMakeId = parseInt(id, 10);
      const machineMakeName = make_name.toString().trim();

      if (isNaN(machineMakeId)) {
        return res.status(400).json({
          message: "Invalid machine make id",
        });
      }

      const result =
        await this.machinesdataRepository.updateMachineMake(
          machineMakeId,
          machineMakeName
        );

      if (result.affectedRows === 0) {
        metaLogger.warn("Machine make not found");

        return res.status(404).json({
          message: "Machine make not found",
        });
      }

      metaLogger.info("Machine make updated successfully");

      return res.status(200).json({
        message: "Machine make updated successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Update machine make error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to update machine make",
        error: process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
      });
    }
  }
}

module.exports = UpdateMachineMakeController;
