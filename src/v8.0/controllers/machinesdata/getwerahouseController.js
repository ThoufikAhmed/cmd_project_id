class GetMachineInOutHistoryController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {

      const result =
        await this.machinesdataRepository.getMachineInOutHistory();

      console.log("Machine werahouse History:", result);

      return res.status(200).json({
        message: "Machine werahouse history fetched successfully",
        count: result.length,
        data: result,
      });

    } catch (error) {
      console.error("Error fetching machine werahouse history:", error);

      return res.status(500).json({
        message: "Failed to fetch machine werahouse history",
      });
    }
  }
}

module.exports = GetMachineInOutHistoryController;