const { getFirebaseAdmin, getFirebaseInitError } = require('./firebase')

const INVALID_TOKEN_ERRORS = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered'
])

const CREDENTIAL_ERRORS = new Set([
  'messaging/mismatched-credential'
])

const isInvalidTokenError = (code, message) => {
  if (code && INVALID_TOKEN_ERRORS.has(code)) {
    return true
  }

  // Firebase Admin may also return invalid token failures as invalid-argument.
  if (code === 'messaging/invalid-argument') {
    const safeMessage = (message || '').toLowerCase()
    return safeMessage.includes('registration token')
  }

  return false
}

const normalizeDataPayload = (data) => {
  const safeData = data || {}
  const entries = Object.entries(safeData).filter(([, value]) => value !== undefined && value !== null)
  return entries.reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'string' ? value : String(value)
    return acc
  }, {})
}

const extractInvalidTokens = (tokens, responseData) => {
  const results = responseData?.responses || []
  const invalidTokens = []

  results.forEach((result, index) => {
    const error = result?.error?.code
    const message = result?.error?.message
    if (isInvalidTokenError(error, message)) {
      invalidTokens.push(tokens[index])
    }
  })

  return invalidTokens
}

const countCredentialErrors = (responseData) => {
  const results = responseData?.responses || []
  return results.filter((result) => CREDENTIAL_ERRORS.has(result?.error?.code)).length
}

module.exports = {
  /**
   * Send push notification to selected user IDs using saved FCM tokens.
   * @param {Object} authRepository
   * @param {number[]} userIds
   * @param {Object} payload
   * @param {string} payload.title
   * @param {string} payload.body
   * @param {Object} payload.data
   */
  sendPushToUserIds: async (authRepository, userIds, payload) => {
    const firebaseAdmin = getFirebaseAdmin()
    if (!firebaseAdmin) {
      return {
        skipped: true,
        reason: getFirebaseInitError() || 'Firebase Admin initialization failed'
      }
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return { skipped: true, reason: 'No target users' }
    }

    const tokenRows = await authRepository.getDeviceTokensByUserIds(userIds)
    const tokens = [...new Set(tokenRows.map(row => row.device_token).filter(Boolean))]

    if (tokens.length === 0) {
      return { skipped: true, reason: 'No active device tokens' }
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: normalizeDataPayload(payload.data),
      tokens
    }

    const response = await firebaseAdmin.messaging().sendEachForMulticast(message)
    const invalidTokens = extractInvalidTokens(tokens, response)
    const credentialErrors = countCredentialErrors(response)

    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`FCM failure for token at index ${idx}:`, resp.error)
        }
      })
    }

    if (invalidTokens.length > 0) {
      await authRepository.deactivateDeviceTokensByTokens([...new Set(invalidTokens)])
    }

    return {
      skipped: false,
      targetedTokens: tokens.length,
      sent: response.successCount || 0,
      failed: response.failureCount || 0,
      invalidTokensDeactivated: invalidTokens.length,
      credentialErrors
    }
  }
}
