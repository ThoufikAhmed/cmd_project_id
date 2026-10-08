
const authRepository = require('../../../models/authentication/repository/auth')
const { sendPushToUserIds } = require('../../../utils/pushNotification')

class PostSubmitMaintenanceController {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async sendTpmCompletedNotification({
    actorUserId,
    machineId,
    machineCode,
    maintenanceType,
    locationName
  }) {
    const recipients = await authRepository.getNotificationRecipients(actorUserId)
    const recipientUserIds = recipients.map(row => Number(row.id)).filter(Boolean)

    if (recipientUserIds.length === 0) {
      return
    }

    const actor = await authRepository.getUserById(actorUserId)
    const actorName = actor?.name || actor?.username || `User ${actorUserId}`

    await sendPushToUserIds(authRepository, recipientUserIds, {
      title: 'TPM Completed',
      body: `${actorName} completed ${maintenanceType} TPM for machine ${machineCode}`,
      data: {
        event_type: 'TPM_COMPLETED',
        machine_id: machineId,
        machine_code: machineCode,
        maintenance_type: maintenanceType,
        location_name: locationName,
        actor_user_id: actorUserId
      }
    })
  }

  async execute(req, res) {
    try {
      const {
        machine_id,
        machine_code,
        machine_name,
        location_name,
        maintenance_type,
        tasks_completed,
        estimated_seconds,
        time_taken_seconds,
        efficiency,
        batch_id,
        remarks,
        barcode
      } = req.body

      const performedBy = req.user?.id

      if (!performedBy) {
        return res.status(401).send({ message: 'Unauthorized' })
      }

      if (
        !machine_id ||
        !machine_code ||
        !machine_name ||
        !location_name ||
        !maintenance_type
      ) {
        return res.status(400).send({
          message: 'Missing required TPM maintenance fields'
        })
      }

      let calculatedEfficiency = null

      if (efficiency !== undefined && efficiency !== null && efficiency !== '') {
        calculatedEfficiency = Number(efficiency)

        if (Number.isNaN(calculatedEfficiency)) {
          return res.status(400).send({ message: 'efficiency must be a number' })
        }
      } else if (
        estimated_seconds &&
        time_taken_seconds &&
        Number(time_taken_seconds) > 0
      ) {
        calculatedEfficiency = Number(
          ((Number(estimated_seconds) / Number(time_taken_seconds)) * 100).toFixed(2)
        )
      }

      console.log('Submitting TPM maintenance with data:', {
        machine_id,
        machine_code,
        machine_name,
        location_name,
        maintenance_type,
        tasks_completed,
        estimated_seconds,
        time_taken_seconds,
        efficiency: calculatedEfficiency,
        batch_id,
        remarks,
        performedBy,
        barcode
      })

      const result = await this.inventoryRepository.submitTpmMaintenance(
        machine_id,
        machine_code,
        machine_name,
        location_name,
        maintenance_type,
        tasks_completed,
        estimated_seconds,
        time_taken_seconds,
        calculatedEfficiency,
        batch_id,
        remarks,
        performedBy,
        barcode
      )

      try {
        if (typeof this.sendTpmCompletedNotification === 'function') {
          await this.sendTpmCompletedNotification({
            actorUserId: performedBy,
            machineId: Number(machine_id),
            machineCode: machine_code,
            maintenanceType: maintenance_type,
            locationName: location_name
          })
        }
      } catch (notificationError) {
        console.error('TPM notification failed:', notificationError.message)
      }

      return res.status(201).send({
        message: 'TPM submitted successfully',
        maintenance_id: result.insertId
      })
    } catch (error) {
      console.error('Error submitting TPM:', error)
      return res.status(500).send({
        message: 'Server error',
        error: error.message
      })
    }
  }
}

module.exports = PostSubmitMaintenanceController
