class PostMachineController {

  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async execute(req, res) {

    try {

      const {
        machine_code,
        machine_name,
        entry_datetime,
        machine_type,
        machine_model,
        machine_make,
        manufactured_date,
        organization_name,
        location,
        barcode,
        machine_status,
        specialization
      } = req.body

      const machineId = await this.inventoryRepository.createMachine(
        machine_code,
        machine_name,
        entry_datetime,
        machine_type,
        machine_model,
        machine_make,
        manufactured_date,
        organization_name,
        location,
        barcode,
        machine_status,
        specialization
      )

      return res.status(201).send({
        message: 'Machine created successfully',
        machine_id: machineId
      })

    } catch (error) {

      console.error('Error creating machine:', error)

      // Handle duplicate barcode nicely
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).send({
          message: 'Barcode already exists'
        })
      }

      return res.status(500).send({
        message: 'An unexpected error occurred.'
      })
    }
  }
}

module.exports = PostMachineController
