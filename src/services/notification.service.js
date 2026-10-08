const { Expo } = require('expo-server-sdk')
const expo = new Expo()

const sendPushNotification = async ({ token, title, body, data = {} }) => {

  // ── Expo Token ─────────────────────────────────────────────
  if (Expo.isExpoPushToken(token)) {
    try {
      const messages = [{
        to: token,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
      }]

      const chunks = expo.chunkPushNotifications(messages)
      const results = []

      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        results.push(...ticketChunk)
      }

      const failed = results.find(r => r.status === 'error')
      if (failed) {
        console.error(`❌ Expo Push Error: ${failed.message}`);
        const isInvalid = failed.details && failed.details.error === 'DeviceNotRegistered';
        return { 
          skipped: true, 
          reason: failed.message,
          code: isInvalid ? 'INVALID_TOKEN' : 'EXPO_ERROR',
          isInvalidToken: isInvalid
        }
      }

      return { success: true, messageId: results[0]?.id }

    } catch (error) {
      return { skipped: true, reason: error.message }
    }
  }

  // ── Firebase FCM Token ──────────────────────────────────────
  const { getFirebaseAdmin, getFirebaseInitError } = require('../utils/firebase')
  const firebaseAdmin = getFirebaseAdmin()

  // --- DEBUGGING FIREBASE CREDENTIALS ---
  if (firebaseAdmin) {
    try {
      const appOptions = firebaseAdmin.app().options;
      console.log("🔍 [DEBUG] Firebase App Project ID:", appOptions.projectId || "Not set in options");
      
      // Try to read credential details if available
      if (appOptions.credential) {
        console.log("🔍 [DEBUG] Firebase Credential Project ID:", appOptions.credential.projectId);
        console.log("🔍 [DEBUG] Firebase Credential Client Email:", appOptions.credential.clientEmail);
      }
    } catch (e) {
      console.log("🔍 [DEBUG] Could not extract Firebase options:", e.message);
    }
  }
  // ---------------------------------------

  if (!firebaseAdmin) {
    return {
      skipped: true,
      reason: getFirebaseInitError() || 'Firebase Admin initialization failed'
    }
  }

  if (!token) {
    return { skipped: true, reason: 'No device token provided' }
  }

  // Validate token format (basic FCM token check)
  if (!token.includes(':') || token.length < 50) {
    console.warn(`⚠️ Invalid Firebase token format: ${token.substring(0, 20)}...`)
    return { skipped: true, reason: 'Invalid device token format' }
  }

  try {
    console.log(`📤 [DEBUG] Sending FCM to Token: ${token.substring(0, 20)}...`);
    console.log(`📦 [DEBUG] FCM Payload Title: "${title}", Body: "${body}"`);

    const messageId = await firebaseAdmin.messaging().send({
      token,
      notification: { title, body },
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'default' }
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } }
      },
      data: Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = typeof value === 'string' ? value : String(value)
        }
        return acc
      }, {})
    })

    return { success: true, messageId }

  } catch (error) {
    // Detect and handle specific Firebase errors
    const errorCode = error.code || ''
    const errorMessage = error.message || ''
    
    // If token is invalid/not found, mark it as such
    if (errorCode === 'messaging/mismatched-credential' ||
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered' ||
        errorMessage.includes('not found') ||
        errorMessage.includes('not registered')) {
      console.error(`❌ Invalid/Mismatched Firebase token: ${token.substring(0, 20)}... (Error: ${errorCode || errorMessage})`)
      return { 
        skipped: true, 
        reason: `Device token is invalid or mismatched for project. (${errorCode})`,
        code: 'INVALID_TOKEN',
        isInvalidToken: true
      }
    }
    
    console.error(`❌ Firebase messaging error: ${errorMessage}`, { errorCode })
    return { skipped: true, reason: error.message, code: errorCode }
  }
}

module.exports = { sendPushNotification }