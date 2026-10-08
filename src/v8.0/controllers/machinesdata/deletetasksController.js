// controllers/DeleteTaskController.js

const logger = require("../../../utils/logger")

class DeleteTaskController {
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

      metaLogger.info(`Deleting task ${id}`)

      await this.machinesdataRepository.deleteTask(id)

      return res.status(200).json({
        message: "Task deleted successfully"
      })

    } catch (error) {
      metaLogger.error(`Delete task error: ${error.message}`)

      return res.status(500).json({
        message: "Failed to delete task"
      })
    }
  }
}

module.exports = DeleteTaskController