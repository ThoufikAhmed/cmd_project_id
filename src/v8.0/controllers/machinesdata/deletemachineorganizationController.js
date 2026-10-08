class DeleteOrganizationByIdController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const { id } = req.params;

      const result =
        await this.machinesdataRepository.deleteOrganizationById(id);

      if (!result.affectedRows) {
        return res.status(404).json({
          message: "Organization not found",
        });
      }

      return res.status(200).json({
        message: "Organization deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({
        message: "Failed to delete organization",
      });
    }
  }
}

module.exports = DeleteOrganizationByIdController;
