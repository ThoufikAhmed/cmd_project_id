class GetTpmSummaryController {

  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async execute(req, res) {

    try {
      const { type } = req.params

      const summary = await this.inventoryRepository.getTpmSummary(type)

      return res.status(200).send(summary[0])

    } catch (error) {
      console.error('Error fetching TPM summary:', error)
      return res.status(500).send({ message: 'Server error' })
    }
  }
}

module.exports = GetTpmSummaryController
