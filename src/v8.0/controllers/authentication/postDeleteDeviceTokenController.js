class PostDeleteDeviceTokenController {
  
  

  async execute (req, res) {
    try {
      const userId = req.user?.id
      const { device_token } = req.body

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      await this.authRepository.deactivateDeviceToken(userId, device_token)

      return res.status(200).json({
        message: 'Device token removed successfully'
      })
    } catch (error) {
      console.error('Error removing device token:', error)
      return res.status(500).json({ message: 'Failed to remove device token' })
    }
  }
}

module.exports = PostDeleteDeviceTokenController
