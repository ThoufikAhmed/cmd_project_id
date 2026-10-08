class PostMachineMakeController {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async execute(req, res) {
    try {
      const { make_name } = req.body

      const id = await this.inventoryRepository.createMachineMake(make_name)

      return res.status(201).send({
        message: 'Machine make created successfully',
        id
      })
    } catch (error) {
      console.error('Error creating machine make:', error)
      return res.status(500).send({ message: 'Failed to create machine make' })
    }
  }
}

module.exports = PostMachineMakeController
