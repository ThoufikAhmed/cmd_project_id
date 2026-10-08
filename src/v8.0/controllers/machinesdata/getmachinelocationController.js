class GetAllLocationsController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const locations =
        await this.machinesdataRepository.getAllLocations();

      return res.status(200).json({
        message: "Locations fetched successfully",
        data: locations,
      });

    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch locations",
      });
    }
  }
}

module.exports = GetAllLocationsController;
