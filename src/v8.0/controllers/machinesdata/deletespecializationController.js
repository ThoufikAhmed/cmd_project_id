class DeleteSpecializationByIdController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;

      const result =
        await this.machinesdataRepository.deleteSpecializationById(id);

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Specialization not found",
        });
      }

      return res.status(200).json({
        message: "Specialization deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({
        message: "Failed to delete specialization",
      });
    }
  }
}

module.exports = DeleteSpecializationByIdController;
