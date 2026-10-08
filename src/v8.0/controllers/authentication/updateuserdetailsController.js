const logger = require("../../../utils/logger");

class UpdateUserByIdController {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;
      const { name, contact, designation, user_type, location_name } = req.body

      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.info(`Updating user with ID: ${id}`);

      const result = await this.authRepository.updateUserById(
        id,
        name.trim(),
        contact.trim(),
        designation.trim(),
        user_type,
        location_name.trim()
        
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      metaLogger.info("User updated successfully");

      return res.status(200).json({
        message: "User updated successfully",
      });

    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      );

      metaLogger.error(`Update user error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to update user",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = UpdateUserByIdController;
