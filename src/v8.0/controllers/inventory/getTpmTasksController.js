class GetTpmTasksController {

  constructor(tpmRepository) {
    this.tpmRepository = tpmRepository
  }

  async execute(req, res) {
    try {
      const { type } = req.params

      const tasks = await this.tpmRepository.getTasksByType(type)

      return res.status(200).send(tasks)

    } catch (error) {
      console.error('Error fetching TPM tasks:', error)
      return res.status(500).send({ message: 'Server error' })
    }
  }
}

module.exports = GetTpmTasksController
