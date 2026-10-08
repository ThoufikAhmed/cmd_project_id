// auth/controllers/AdminLogoutAllUsersController.js
const logger = require('../../../utils/logger')

class PostAdminLogoutAllUsersController {
  constructor (authRepository) {
    this.authRepository = authRepository
  }

  async execute (req, res) {
    try {
      const adminId = req.user.id
      const adminUsername = req.user.username
      const { locals: { requestId } } = res
      
      const metaLogger = logger.logWithMetaData(requestId, req.originalUrl)

      metaLogger.info(`Admin ${adminUsername} (ID: ${adminId}) initiating LOGOUT ALL USERS...`)

      // Get count of active sessions before deletion
      const activeSessionsCount = await this.authRepository.countAllActiveSessions()
      
      // Delete ALL sessions from ALL users
      const result = await this.authRepository.deleteAllSessions()
      const sessionsDeleted = result.affectedRows || 0
      
      // Clear all refresh tokens from all users
      await this.authRepository.clearAllRefreshTokens()
      
      // Log the critical admin action
      await this.authRepository.insertAdminActionLog(
        adminId, 
        null,  // null userId means action affects all users
        'FORCE_LOGOUT_ALL_USERS', 
        `Admin ${adminUsername} forcefully logged out ALL users. ${sessionsDeleted} sessions terminated.`
      )

      metaLogger.info(`CRITICAL ACTION: All user sessions terminated by admin ${adminUsername}. Sessions deleted: ${sessionsDeleted}`)

      return res.status(200).json({ 
        message: 'All users logged out from all devices successfully',
        sessionsTerminated: sessionsDeleted,
        performedBy: adminUsername,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      const metaLogger = logger.logWithMetaData(res.locals.requestId, req.originalUrl)
      metaLogger.error(`Admin logout all users error: ${error.message}`)
      
      return res.status(500).json({ 
        message: 'An error occurred during admin logout all operation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = PostAdminLogoutAllUsersController