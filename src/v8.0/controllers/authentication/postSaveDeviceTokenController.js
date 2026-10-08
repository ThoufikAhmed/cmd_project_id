class PostSaveDeviceTokenController {
  constructor (authRepository) {
    this.authRepository = authRepository
  }

  async execute (req, res) {
    try {
      const userId = req.user?.id
      const { device_token, platform } = req.body

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      await this.authRepository.upsertDeviceToken(userId, device_token, platform)

      return res.status(200).json({
        message: 'Device token saved successfully'
      })
    } catch (error) {
      console.error('Error saving device token:', error)
      return res.status(500).json({ message: 'Failed to save device token' })
    }
  }
}

module.exports = PostSaveDeviceTokenController
