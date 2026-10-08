class GetNotificationsController {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  async execute(req, res) {
    try {
      const userId = req.user ? req.user.id : req.query.userId;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required to fetch notifications' });
      }

      const notifications = await this.inventoryRepository.getNotifications(userId);

      return res.status(200).json(notifications);
    } catch (error) {
      console.error('GetNotificationsController Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = GetNotificationsController;