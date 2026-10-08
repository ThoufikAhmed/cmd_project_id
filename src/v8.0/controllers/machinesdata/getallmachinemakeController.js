class GetAllMachineMakesController {
  constructor(machinesdataRepository) {
    this.machinesdataRepository = machinesdataRepository;
  }

  async execute(req, res) {
    try {
      const result =
        await this.machinesdataRepository.getAllMachineMakes();
        console.log('hrfbb',result);
        return res.status(200).json({
          message: "Machine makes fetched successfully",
          data: result,
        });
        
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch machine makes",
      });
    }  
  }
}

module.exports = GetAllMachineMakesController;
