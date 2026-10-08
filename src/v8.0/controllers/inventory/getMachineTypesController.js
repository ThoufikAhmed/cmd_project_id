class GetMachineTypesController {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async execute(req, res) {
    try {
      const types = await this.inventoryRepository.getMachineTypes()
      return res.status(200).send(types)
    } catch (error) {
      console.error('Error fetching machine types:', error)
      return res.status(500).send({ message: 'Failed to fetch machine types' })
    }
  }
}

module.exports = GetMachineTypesController
