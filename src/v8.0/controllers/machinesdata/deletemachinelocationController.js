class DeleteLocationByIdController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;

      const result =
        await this.machinesdataRepository.deleteLocationById(id);

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Location not found",
        });
      }

      return res.status(200).json({
        
        message: "Location deleted successfully",
      });
      

    } catch (error) {
      return res.status(500).json({
        message: "Failed to delete location",
      });
    }
  }
}

module.exports = DeleteLocationByIdController;
