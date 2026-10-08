class GetTpmHistoryController {

  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async execute(req, res) {

    try {
      const { machineId } = req.params

      const history = await this.inventoryRepository.getTpmHistory(machineId)

      return res.status(200).send(history)

    } catch (error) {
      console.error('Error fetching TPM history:', error)
      return res.status(500).send({ message: 'Server error' })
    }
  }
}

module.exports = GetTpmHistoryController
