const authRepository = require('../../../models/authentication/repository/auth')
const { sendPushToUserIds } = require('../../../utils/pushNotification')

class PostAttendTicketController {

  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  async sendTicketAttendedNotification ({ actorUserId, ticketId, actionTaken }) {
    const recipients = await authRepository.getNotificationRecipients(actorUserId)
    const recipientUserIds = recipients.map(row => Number(row.id)).filter(Boolean)

    if (recipientUserIds.length === 0) {
      return
    }

    const actor = await authRepository.getUserById(actorUserId)
    const actorName = actor?.name || actor?.username || `User ${actorUserId}`

    await sendPushToUserIds(authRepository, recipientUserIds, {
      title: 'Breakdown Ticket Closed',
      body: `${actorName} attended ticket #${ticketId}`,
      data: {
        event_type: 'BREAKDOWN_ATTENDED',
        ticket_id: ticketId,
        action_taken: actionTaken,
        actor_user_id: actorUserId
      }
    })
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async execute(req, res) {


    try {

      const {
        ticket_id,
        action_taken,
        remarks,
        status
      } = req.body
      const attendedBy = req.user?.id

      console.log("Attending ticket:", {
        ticket_id,
        attended_by: attendedBy,
        action_taken,
        remarks,
        status: req.body.status
      })

      if (!attendedBy) {
        return res.status(401).send({
          message: 'Unauthorized'
        })
      }

      if (!ticket_id) {
        return res.status(400).send({
          message: "ticket_id is required"
        })
      }

      await this.inventoryRepository.attendTicket(
        ticket_id,
        attendedBy,
        action_taken,
        remarks,
        status
      )

      try {
        await this.sendTicketAttendedNotification({
          actorUserId: attendedBy,
          ticketId: Number(ticket_id),
          actionTaken: action_taken
        })
      } catch (notificationError) {
        console.error('Attend-ticket notification failed:', notificationError.message)
      }

      return res.status(200).send({
        message: "Ticket attended successfully"
      })

    } catch (error) {

      console.error("Error attending ticket:", error)

      return res.status(500).send({
        message: "Failed to attend ticket"
      })
    }
  }
}
module.exports = PostAttendTicketController
