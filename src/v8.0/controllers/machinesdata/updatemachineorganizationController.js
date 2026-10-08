const logger = require("../../../utils/logger");

class UpdateOrganizationByIdController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;
      const { org_name } = req.body;

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info("Updating organization...");

      if (!org_name) {
        return res.status(400).json({
          message: "Organization name is required",
        });
      }

      const organizationName = org_name.toString().trim();

      const result =
        await this.machinesdataRepository.updateOrganizationById(
          id,
          organizationName
        );

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Organization not found",
        });
      }

      metaLogger.info("Organization updated successfully");

      return res.status(200).json({
        message: "Organization updated successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Update organization error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to update organization",
      });
    }
  }
}

module.exports = UpdateOrganizationByIdController;
