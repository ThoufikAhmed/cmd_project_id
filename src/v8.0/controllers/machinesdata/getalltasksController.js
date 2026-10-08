// controllers/GetAllTasksController.js

const logger = require("../../../utils/logger")

class GetAllTasksController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    )

    try {
      metaLogger.info("Fetching all TPM tasks")

      const data = await this.machinesdataRepository.getAllTasks()

      return res.status(200).json({
        message: "Tasks fetched successfully",
        data
      })

    } catch (error) {
      metaLogger.error(`Get tasks error: ${error.message}`)

      return res.status(500).json({
        message: "Failed to fetch tasks",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      })
    }
  }
}

module.exports = GetAllTasksController