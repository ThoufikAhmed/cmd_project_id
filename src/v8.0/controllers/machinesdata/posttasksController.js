// controllers/CreateTaskController.js

const logger = require("../../../utils/logger")

class CreateTaskController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    )

    try {
      metaLogger.info("Creating TPM task")

      const result = await this.machinesdataRepository.createTask(req.body)

      return res.status(201).json({
        message: "Task created successfully",
        
      })

    } catch (error) {
      metaLogger.error(`Create task error: ${error.message}`)

      return res.status(500).json({
        message: "Failed to create task"
      })
    }
  }
}

module.exports = CreateTaskController