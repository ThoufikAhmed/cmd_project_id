class PostMachineTypeController {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async execute(req, res) {
    try {
      const { type_name } = req.body

      const id = await this.inventoryRepository.createMachineType(type_name)

      return res.status(201).send({
        message: 'Machine type created successfully',
        id
      })
    } catch (error) {
      console.error('Error creating machine type:', error)
      return res.status(500).send({ message: 'Failed to create machine type' })
    }
  }
}

module.exports = PostMachineTypeController
