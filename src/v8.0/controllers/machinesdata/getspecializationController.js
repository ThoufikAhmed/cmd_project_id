class GetAllSpecializationsController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const result =
        await this.machinesdataRepository.getAllSpecializations();

      return res.status(200).json({
        message: "Specializations fetched successfully",
        data: result,
      });

    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch specializations",
      });
    }
  }
}

module.exports = GetAllSpecializationsController;
