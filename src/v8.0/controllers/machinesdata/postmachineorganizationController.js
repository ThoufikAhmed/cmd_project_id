const logger = require("../../../utils/logger");

class PostOrganizationController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { org_name } = req.body;

      const { locals: { requestId } } = res;
      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl);

      metaLogger.info("Creating organization...");

      if (!org_name) {
        return res.status(400).json({
          message: "Organization name is required",
        });
      }

      const organizationName = org_name.toString().trim();

      await this.machinesdataRepository.insertOrganization(
        organizationName
      );

      metaLogger.info("Organization created successfully");

      return res.status(201).json({
        message: "Organization created successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Create organization error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to create organization",
        error: process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
      });
    }
  }
}

module.exports = PostOrganizationController;
