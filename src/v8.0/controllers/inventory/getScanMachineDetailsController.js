class GetScanMachineController {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async execute(req, res) {
    try {
      const { barcode } = req.params

      const result = await this.inventoryRepository.getScanMachineDetails(barcode)

      if (!result.length) {
        return res.status(404).send({ message: 'Machine not found' })
      }

      const machine = result[0]

      let totalBreakdown = 0

      const breakdownLogs = result
        .filter(r => r.sl_no)
        .map(r => {
          totalBreakdown += Number(r.bd_time || 0)

          return {
            sl_no: r.sl_no,
            date: r.date,
            location: r.location,
            batch: r.batch,
            issue_type: r.type_of_issue,
            breakdown_seconds: r.bd_time,
            attended_by: r.attended_by
          }
        })

      return res.send({
        machine: {
          si_no: machine.si_no,
          machine_type: machine.machine_type,
          machine_model: machine.machine_model,
          machine_make: machine.machine_make,
          machine_qr: machine.machine_qr,
          machine_age: machine.machine_age
        },
        total_breakdown_seconds: totalBreakdown,
        breakdownLogs
      })
    } catch (err) {
      console.error('Error scan machine:', err)
      return res.status(500).send({ message: 'Server error' })
    }
  }
}

module.exports = GetScanMachineController
