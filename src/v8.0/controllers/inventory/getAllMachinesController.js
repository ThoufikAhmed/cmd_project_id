class GetAllMachinesController {
  constructor (inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async execute (req, res) {
    try {
      const barcode = req.params?.barcode || req.query?.barcode
      const machines = await this.inventoryRepository.getAllMachines(barcode)
      return res.status(200).json(machines)
    } catch (error) {
      console.error('Error fetching machines:', error)
      return res.status(500).json({ message: 'An unexpected error occurred.' })
    }
  }
}

module.exports = GetAllMachinesController
