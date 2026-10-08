class UpdateSpecializationByIdController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;
      const { specialization } = req.body;

      console.log("ID:", id);
      console.log("Received specialization:", specialization);

      if (!specialization) {
        return res.status(400).json({
          message: "Specialization is required",
        });
      }

      const result =
        await this.machinesdataRepository.updateSpecializationById(
          id,
          specialization.trim()
        );

      console.log("DB Result:", result);

      if (!result || result.affectedRows === 0) {
        return res.status(404).json({
          message: "Specialization not found",
        });
      }

      return res.status(200).json({
        message: "Specialization updated successfully",
      });

    } catch (error) {
      console.error("Error:", error); // VERY IMPORTANT
      return res.status(500).json({
        message: "Failed to update specialization",
        error: error.message
      });
    }
  }
}

module.exports = UpdateSpecializationByIdController;