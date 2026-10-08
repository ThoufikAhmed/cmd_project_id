class GetcompletdandattendedticketsController {
  constructor(breakdowndataRepository) {
    this.breakdowndataRepository = breakdowndataRepository;
  }

  async execute(req, res) {
    try {
      const result =
        await this.breakdowndataRepository.getCompletedAndAttendedTickets();

      return res.status(200).json({
        message: "Breakdown ticket details fetched successfully",
        totalRecords: result.length,
        data: result,
      });

    } catch (error) {
      console.error("Error fetching breakdown ticket details:", error);

      return res.status(500).json({
        message: "Failed to fetch breakdown ticket details",
      });
    }
  }
}

module.exports = GetcompletdandattendedticketsController;
