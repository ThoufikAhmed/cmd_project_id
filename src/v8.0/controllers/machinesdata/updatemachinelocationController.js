class UpdateLocationByIdController {
  constructor(cmdLocationRepository) {
    this.cmdLocationRepository = cmdLocationRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;
      const { location_name } = req.body;

      if (!location_name) {
        return res.status(400).json({
          message: "Location name is required",
        });
      }

      const result =
        await this.cmdLocationRepository.updateLocationById(
          id,
          location_name.trim()
        );

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Location not found",
        });
      }

      return res.status(200).json({
        message: "Location updated successfully",
      });

    } catch (error) {
      return res.status(500).json({
        message: "Failed to update location",
      });
    }
  }
}

module.exports = UpdateLocationByIdController;
