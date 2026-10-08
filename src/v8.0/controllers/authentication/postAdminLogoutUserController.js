
// auth/controllers/AdminLogoutUserController.js

const logger = require('../../../utils/logger')

class PostAdminLogoutUserController {
  constructor(authRepository) {
    this.authRepository = authRepository
  }

  async execute(req, res) {
    try {
      const { userId } = req.body
      const adminId = req.user.id
      const adminUsername = req.user.username
      const { locals: { requestId } } = res

      const metaLogger = logger.logWithMetaData(
        requestId,
        req.originalUrl
      )

      // Validate userId
      if (!userId) {
        metaLogger.error('No userId provided')

        return res.status(400).json({
          message: 'userId is required'
        })
      }

      metaLogger.info(
        `Admin ${adminUsername} (ID: ${adminId}) logging out user ID ${userId}`
      )

      // Check user exists
      const targetUser = await this.authRepository.getUserById(userId)

      if (!targetUser) {
        metaLogger.error(`User ID ${userId} not found`)

        return res.status(404).json({
          message: 'User not found'
        })
      }

      // Delete all sessions
      const result =
        await this.authRepository.deleteAllSessionsByUserId(userId)

      const sessionsDeleted = result?.affectedRows || 0

      // Clear refresh token
      await this.authRepository.clearRefreshToken(userId)

      // Update cmd_users status = 0 (offline)
      await this.authRepository.updateUserandStatus(userId, 0)

      // Admin action log
      await this.authRepository.insertAdminActionLog(
        adminId,
        userId,
        'FORCE_LOGOUT_ALL',
        `Admin ${adminUsername} revoked all sessions for user ${targetUser.username}`
      )

      // Logout log
      await this.authRepository.insertLogoutLog(userId)

      metaLogger.info(
        `User ${targetUser.username} logged out successfully. Status updated to 0.`
      )

      return res.status(200).json({
        success: true,
        message: `User ${targetUser.username} logged out successfully`,
        targetUser: {
          id: targetUser.id,
          username: targetUser.username,
          status: 0
        },
        sessionsTerminated: sessionsDeleted,
        performedBy: adminUsername
      })
    } catch (error) {
      const metaLogger = logger.logWithMetaData(
        res.locals.requestId,
        req.originalUrl
      )

      metaLogger.error(
        `Admin logout user error: ${error.message}`
      )

      return res.status(500).json({
        success: false,
        message: 'An error occurred during admin logout operation',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : undefined
      })
    }
  }
}

module.exports = PostAdminLogoutUserController

