const logger = require("../../../utils/logger");

class GetNotAttendedTicketsController {
  constructor(breakdownRepository) {
    this.breakdownRepository = breakdownRepository;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info("Fetching NOT ATTENDED tickets");

      const data = await this.breakdownRepository.getNotAttendedTickets();

      return res.status(200).json({
        message: "Not attended tickets fetched successfully",
        data,
      });

    } catch (error) {
      metaLogger.error(`Not attended tickets error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch not attended tickets",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = GetNotAttendedTicketsController;