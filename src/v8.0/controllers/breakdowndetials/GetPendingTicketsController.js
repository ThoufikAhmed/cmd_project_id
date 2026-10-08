const logger = require("../../../utils/logger");

class GetPendingTicketsController {
  constructor(breakdownRepository) {
    this.breakdownRepository = breakdownRepository;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      metaLogger.info("Fetching PENDING tickets");

      const data = await this.breakdownRepository.getPendingTickets();

      return res.status(200).json({
        message: "Pending tickets fetched successfully",
        data,
      });

    } catch (error) {
      metaLogger.error(`Pending tickets error: ${error.message}`);

      return res.status(500).json({
        message: "Failed to fetch pending tickets",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = GetPendingTicketsController;