class GetMachineMakesController {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async execute(req, res) {
    try {
      const makes = await this.inventoryRepository.getMachineMakes()
      return res.status(200).send(makes)
    } catch (error) {
      console.error('Error fetching machine makes:', error)
      return res.status(500).send({ message: 'Failed to fetch machine makes' })
    }
  }
}

module.exports = GetMachineMakesController
