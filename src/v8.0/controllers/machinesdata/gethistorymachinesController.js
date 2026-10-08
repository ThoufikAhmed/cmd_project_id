class GetMachineHistoryController {
    constructor(machinesdataRepository) {
        this.machinesdataRepository = machinesdataRepository;
    }

    async execute(req, res) {
        try {
            const result =
                await this.machinesdataRepository.getMachineActivity();
            return res.status(200).json({
                message: "Machine activity fetched successfully",
                data: result,
            });

        } catch (error) {
            return res.status(500).json({
                message: "Failed to fetch machine activity",
            });
        }
    }
}

module.exports = GetMachineHistoryController;