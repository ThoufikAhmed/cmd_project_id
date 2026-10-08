const logger = require("../../../utils/logger");

class postAssignTicketController {
  constructor(breakdownRepository, notificationService) {
    this.breakdownRepository = breakdownRepository;
    this.notificationService = notificationService;
  }

  async execute(req, res) {
    const metaLogger = logger.logWithMetaData(
      res.locals.requestId,
      req.originalUrl
    );

    try {
      console.log("🔥 API HIT: /assign-ticket");

      console.log("📥 Request Body:", req.body);
      console.log("👤 Logged-in User:", req.user);

      const {
        ticket_id,
        assigned_to,
        assignment_type
      } = req.body;

      const assigned_by = req.user?.id;

      console.log("➡️ ticket_id:", ticket_id);
      console.log("➡️ assigned_to:", assigned_to);
      console.log("➡️ assigned_by:", assigned_by);
      console.log("➡️ assignment_type:", assignment_type);

      if (!ticket_id || !assigned_to) {
        console.log("❌ Missing required fields");

        return res.status(400).json({
          message: "ticket_id and assigned_to are required",
        });
      }

      metaLogger.info(
        `Assigning ticket ${ticket_id} to user ${assigned_to}`
      );

      // 1️⃣ Insert assignment log
      console.log("📝 Inserting assignment log...");

      await this.breakdownRepository.insertAssignmentLog(
        ticket_id,
        assigned_by,
        assigned_to,
        assignment_type
      );

      console.log("✅ Assignment log inserted");

      // 2️⃣ Get user (name + device token)
      console.log("🔍 Fetching user with device token...");

      const user =
        await this.breakdownRepository.getUserByIdWithToken(assigned_to);

      console.log("👤 User Data:", user);

      if (!user) {
        console.log("❌ User or token not found");

        return res.status(404).json({
          message: "User or device token not found",
        });
      }

      // 3️⃣ Send Firebase notification
      console.log("📲 Sending Firebase notification...");

      let firebaseResponse = null;
      try {
        firebaseResponse =
          await this.notificationService.sendPushNotification({
            token: user.device_token,
            title: "New Ticket Assigned",
            body: `Hi ${user.name}, Ticket #${ticket_id} assigned to you`,
          });

        console.log("✅ Firebase Response:", firebaseResponse);

        // Handle invalid token by cleaning it up
        if (firebaseResponse?.isInvalidToken || firebaseResponse?.code === 'INVALID_TOKEN') {
          console.log("🗑️ Removing invalid device token for user:", assigned_to);
          try {
            // Deactivate ONLY the specific invalid token from the database
            await this.breakdownRepository.updateUserDeviceToken(assigned_to, user.device_token);
            metaLogger.info(
              `Invalid device token detected for user ${assigned_to}. Token needs refresh.`
            );
          } catch (cleanupError) {
            console.log("⚠️ Could not deactivate device token:", cleanupError.message);
          }
        }
      } catch (firebaseError) {
        console.log("❌ Firebase Error:", firebaseError.message);

        metaLogger.error(
          "Firebase error: " + firebaseError.message
        );
      }

      // 4️⃣ Store notification
      console.log("💾 Inserting notification record...");

      await this.breakdownRepository.insertNotification(
        ticket_id,
        assigned_to
      );

      console.log("✅ Notification stored in DB");

      console.log("🎉 PROCESS COMPLETED SUCCESSFULLY");

      return res.status(200).json({
        message: "Ticket assigned and notification processed successfully",
        assignment_type
      });

    } catch (error) {
      console.log("💥 ERROR:", error);

      metaLogger.error(
        `Assign ticket error: ${error.message}`
      );

      return res.status(500).json({
        message: "Failed to assign ticket",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
}

module.exports = postAssignTicketController;