const logger = require("../../../utils/logger");

class UpdateMachineTypeController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;
      const { type_name } = req.body;

      const {
        locals: { requestId },
      } = res;

      const metaLogger = logger.logWithMetaData(
        requestId,
        req.originalUrl
      );

      metaLogger.info("Updating machine type...");

      // Validation
      if (!id) {
        return res.status(400).json({
          message: "Machine type id is required",
        });
      }

      if (!type_name) {
        return res.status(400).json({
          message: "Machine type name is required",
        });
      }

      // Ensure proper types
      const machineTypeId = parseInt(id, 10);
      const machineTypeName = type_name.toString().trim();

      if (isNaN(machineTypeId)) {
        return res.status(400).json({
          message: "Invalid machine type id",
        });
      }

      const result = await this.machinesdataRepository.updateMachineTypeById(
        machineTypeId,
        machineTypeName
      );

      if (result.affectedRows === 0) {
        metaLogger.warn("Machine type not found");

        return res.status(404).json({
          message: "Machine type not found",
        });
      }

      metaLogger.info("Machine type updated successfully");

      return res.status(200).json({
        message: "Machine type updated successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Update machine type error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to update machine type",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = UpdateMachineTypeController;