const authRepository = require('../../../models/authentication/repository/auth')
const { sendPushToUserIds } = require('../../../utils/pushNotification')

class PostBreakdownRaiseTicketController {
  constructor (inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async sendBreakdownRaisedNotification ({
    actorUserId,
    ticketId,
    machineId,
    issueType,
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
      title: 'Breakdown Ticket Raised',
      body: `${actorName} raised a breakdown ticket for machine ${machineId}`,
      data: {
        event_type: 'BREAKDOWN_RAISED',
        ticket_id: ticketId,
        machine_id: machineId,
        issue_type: issueType,
        actor_user_id: actorUserId,
        location_name: locationName
      }
    })
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async execute (req, res) {
    try {
      const {
        machine_id,
        id,
        location_name,
        batch_id,
        issue_type,
        issue_description,
        reason,
        remarks,
        machine_status
      } = req.body

      const normalizedIssueType = issue_type || reason
      const normalizedIssueDescription = issue_description !== undefined ? issue_description : remarks
      const machineId = machine_id !== undefined ? machine_id : id
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).send({ message: 'Unauthorized' })
      }

      if (machineId === undefined || machineId === null || machineId === '') {
        return res.status(400).send({ message: 'machine_id is required' })
      }

      if (!normalizedIssueType) {
        return res.status(400).send({ message: 'issue_type is required' })
      }

      const result = await this.inventoryRepository.createBreakdownRaiseTicket({
        machine_id: Number(machineId),
        location_name,
        batch_id: String(batch_id),
        issue_type: normalizedIssueType,
        issue_description: normalizedIssueDescription,
        raised_by: userId,
        machine_status: machine_status || 'BREAKDOWN'
      })

      if (result.affectedRows > 0) {
        try {
          await this.sendBreakdownRaisedNotification({
            actorUserId: userId,
            ticketId: result.insertId,
            machineId: Number(machineId),
            issueType: normalizedIssueType,
            locationName: location_name
          })
        } catch (notificationError) {
          console.error('Breakdown notification failed:', notificationError.message)
        }

        return res.status(201).send({
          message: 'Breakdown ticket raised successfully',
          ticket_id: result.insertId
        })
      }
      console.error('Failed to raise breakdown ticket:', result)
      return res.status(400).send({ message: 'Unable to raise breakdown ticket' })
    } catch (error) {
      console.error('Error raising breakdown ticket:', error)
      return res.status(500).send({ message: 'An unexpected error occurred.' })
    }
  }
}

module.exports = PostBreakdownRaiseTicketController
