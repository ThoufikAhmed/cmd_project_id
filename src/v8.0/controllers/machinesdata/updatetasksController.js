// controllers/UpdateTaskController.js

const logger = require("../../../utils/logger")

class UpdateTaskController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    )

    try {
      const { id } = req.params

      metaLogger.info(`Updating task ${id}`)
console.log("Request body:", req.body) // Debug log to check the request body
      await this.machinesdataRepository.updateTaskById(id, req.body)

      return res.status(200).json({
        message: "Task updated successfully"
      })

    } catch (error) {
      metaLogger.error(`Update task error: ${error.message}`)

      return res.status(500).json({
        message: "Failed to update task"
      })
    }
  }
}

module.exports = UpdateTaskController