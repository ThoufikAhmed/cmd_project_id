/**
 * @module repository/auth
 */
const db = require("../../../model/db");

module.exports = {
  /**
   * This function is responsible for fetching authenticated user by username
   * @name getAuthUserByUsername
   * @function
   * @param {String} username The username to fetch
   * @returns {Object} The user object
   */
  getAuthUserByUsername: async function (username) {
    const query = `
      SELECT * FROM cmd_auth_users
      WHERE username = ?
      LIMIT 1;
    `;
    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      username  
    );
    return result[0];
  },

  /**
   * This function is responsible for inserting authentication log
   * @name insertAuthLog
   * @function
   * @param {Number} userId The user ID
   * @param {String} ip The IP address
   * @param {String} deviceInfo The device information
   * @param {String} status The login status
   * @returns {Object} The result of insert operation
   */
  insertAuthLog: async function (userId, ip, deviceInfo, status) {
    const query = `
      INSERT INTO cmd_auth_logs
        (user_id, login_time, ip_address, device_info, status, creation_stamp)
      VALUES (?, NOW(), ?, ?, ?, NOW());
    `;
    return db.mysqlHelpers.runQueryWithParameters(
      query,
      userId,
      ip,
      deviceInfo,
      status
    );
  },

  /**
   * This function is responsible for fetching session by token
   * @name getSessionByToken
   * @function
   * @param {String} token The authentication token
   * @returns {Object} The session object
   */
  getSessionByToken: async function (token) {
    const query = `
      SELECT * FROM cmd_auth_tokens
      WHERE token = ?
      LIMIT 1;
    `;
    const result = await db.mysqlHelpers.runQueryWithParameters(query, token);
    return result[0];
  },

  /**
   * This function is responsible for deleting session by ID
   * @name deleteSessionById
   * @function
   * @param {Number} sessionId The session ID
   * @returns {Object} The result of delete operation
   */
  deleteSessionById: async function (sessionId) {
    const query = `
      DELETE FROM cmd_auth_tokens
      WHERE id = ?;
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, sessionId);
  },

  /**
   * This function is responsible for saving user session
   * @name saveSession
   * @function
   * @param {Number} userId The user ID
   * @param {String} refreshToken The refresh token
   * @param {Date} expiresAt The token expiration date
   * @param {String} deviceInfo The device information
   * @returns {Object} The result of insert operation
   */
  saveSession: async function (userId, refreshToken, expiresAt, deviceInfo) {
    const query = `
      INSERT INTO cmd_auth_tokens 
        (user_id, token, expires_at, device_info, creation_stamp)
      VALUES (?, ?, ?, ?, NOW());
    `;
    return db.mysqlHelpers.runQueryWithParameters(
      query,
      userId,
      refreshToken,
      expiresAt,
      deviceInfo
    );
  },

  /**
   * This function is responsible for updating refresh token on user
   * @name updateRefreshTokenOnUser
   * @function
   * @param {Number} userId The user ID
   * @param {String} refreshToken The new refresh token
   * @returns {Object} The result of update operation
   */
  updateRefreshTokenOnUser: async function (userId, refreshToken) {
    const query = `
      UPDATE cmd_auth_users 
      SET refresh_token = ?, update_stamp = NOW()
      WHERE id = ?;
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, refreshToken, userId);
  },

  /**
   * This function is responsible for inserting a new user
   * @name insertUser
   * @function
   * @param {String} name The user name
   * @param {String} contact The user contact
   * @param {String} designation The user designation
   * @param {String} location_name The location name
   * @param {String} userType The user type
   * @returns {Object} The result of insert operation
   */
  insertUser: async function (
    name,
    contact,
    designation,
    location_name,
    userType
  ) {
    const query = `
      INSERT INTO cmd_users 
        (name, contact, designation, location_name, user_type, creation_stamp)
      VALUES (?, ?, ?, ?, ?, NOW());
    `;
    return db.mysqlHelpers.runQueryWithParameters(
      query,
      name,
      contact,
      designation,
      location_name,
      userType
    );
  },

  /**
   * This function is responsible for inserting authentication user
   * @name insertAuthUser
   * @function
   * @param {Number} userId The user ID
   * @param {String} username The username
   * @param {String} passwordHash The password hash
   * @param {String} authRole The authentication role
   * @returns {Object} The result of insert operation
   */
  insertAuthUser: async function (userId, username, passwordHash, authRole) {
    const query = `
      INSERT INTO cmd_auth_users 
        (user_id, username, password_hash, auth_role, creation_stamp)
      VALUES (?, ?, ?, ?, NOW());
    `;
    return db.mysqlHelpers.runQueryWithParameters(
      query,
      userId,
      username,
      passwordHash,
      authRole
    );
  },

  /**
   * This function is responsible for deleting all sessions for a specific user
   * @name deleteAllSessionsByUserId
   * @function
   * @param {Number} userId The user ID
   * @returns {Object} The result of delete operation
   */
  deleteAllSessionsByUserId: async function (userId) {
    const query = `
      DELETE FROM cmd_auth_tokens
      WHERE user_id = ?;
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, userId);
  },

  /**
   * This function is responsible for clearing refresh token for a user
   * @name clearRefreshToken
   * @function
   * @param {Number} userId The user ID
   * @returns {Object} The result of update operation
   */
  clearRefreshToken: async function (userId) {
    const query = `
      UPDATE cmd_auth_users 
      SET refresh_token = NULL, update_stamp = NOW()
      WHERE id = ?;
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, userId);
  },

  /**
   * This function is responsible for clearing refresh token if it matches
   * @name clearRefreshTokenIfMatches
   * @function
   * @param {Number} userId The user ID
   * @param {String} refreshToken The refresh token to match
   * @returns {Object} The result of update operation
   */
  clearRefreshTokenIfMatches: async function (userId, refreshToken) {
    const query = `
      UPDATE cmd_auth_users 
      SET refresh_token = NULL, update_stamp = NOW()
      WHERE id = ? AND refresh_token = ?;
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, userId, refreshToken);
  },

  /**
   * This function is responsible for inserting logout log
   * @name insertLogoutLog
   * @function
   * @param {Number} userId The user ID
   * @returns {Object} The result of insert operation
   */
  insertLogoutLog: async function (userId) {
    const query = `
      INSERT INTO cmd_auth_logs 
        (user_id, login_time, status, creation_stamp)
      VALUES (?, NOW(), 'LOGOUT', NOW());
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, userId);
  },

  /**
   * This function is responsible for fetching user by ID
   * @name getUserById
   * @function
   * @param {Number} userId The user ID
   * @returns {Object} The user object
   */
  getUserById: async function (userId) {
    const query = `
      SELECT u.id, u.name, au.username, au.auth_role
      FROM cmd_users u
      JOIN cmd_auth_users au ON u.id = au.user_id
      WHERE u.id = ?
      LIMIT 1;
    `;
    const result = await db.mysqlHelpers.runQueryWithParameters(query, userId);
    return result[0];
  },

  /**
   * This function is responsible for inserting admin action log
   * @name insertAdminActionLog
   * @function
   * @param {Number} adminId The admin user ID
   * @param {Number} targetUserId The target user ID
   * @param {String} action The action performed
   * @param {String} description The action description
   * @returns {Object} The result of insert operation
   */
  insertAdminActionLog: async function (
    adminId,
    targetUserId,
    action,
    description
  ) {
    const query = `
      INSERT INTO cmd_admin_action_logs 
        (admin_id, target_user_id, action, description, creation_stamp)
      VALUES (?, ?, ?, ?, NOW());
    `;
    return db.mysqlHelpers.runQueryWithParameters(
      query,
      adminId,
      targetUserId,
      action,
      description
    );
  },

  /**
   * This function is responsible for counting all active sessions
   * @name countAllActiveSessions
   * @function
   * @returns {Number} The count of active sessions
   */
  countAllActiveSessions: async function () {
    const query = `
      SELECT COUNT(*) as count 
      FROM cmd_auth_tokens
      WHERE expires_at > NOW();
    `;
    const result = await db.mysqlHelpers.runQuery(query);
    return result[0]?.count || 0;
  },

  /**
   * This function is responsible for deleting all sessions from all users
   * @name deleteAllSessions
   * @function
   * @returns {Object} The result of delete operation
   */
  deleteAllSessions: async function () {
    const query = `
      DELETE FROM cmd_auth_tokens;
    `;
    return db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for clearing all refresh tokens from all users
   * @name clearAllRefreshTokens
   * @function
   * @returns {Object} The result of update operation
   */
  clearAllRefreshTokens: async function () {
    const query = `
      UPDATE cmd_auth_users 
      SET refresh_token = NULL, update_stamp = NOW();
    `;
    return db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for saving password reset token
   * @name savePasswordResetToken
   * @function
   * @param {Number} userId The user ID
   * @param {String} token The reset token
   * @param {Date} expiresAt The token expiration date
   * @returns {Object} The result of insert operation
   */
  savePasswordResetToken: async function (userId, token, expiresAt) {
    const query = `
    INSERT INTO cmd_auth_tokens 
      (user_id, token, expires_at, device_info, creation_stamp)
    VALUES (?, ?, ?, 'PASSWORD_RESET', NOW());
  `;
    return db.mysqlHelpers.runQueryWithParameters(
      query,
      userId,
      token,
      expiresAt
    );
  },

  /**
   * This function is responsible for fetching password reset token
   * @name getPasswordResetToken
   * @function
   * @param {String} token The reset token
   * @returns {Object} The token object
   */
  getPasswordResetToken: async function (token) {
    const query = `
    SELECT * FROM cmd_auth_tokens
    WHERE token = ? 
      AND device_info = 'PASSWORD_RESET'
      AND expires_at > NOW()
    LIMIT 1;
  `;
    const result = await db.mysqlHelpers.runQueryWithParameters(query, token);
    return result[0];
  },

  /**
   * This function is responsible for deleting password reset token
   * @name deletePasswordResetToken
   * @function
   * @param {String} token The reset token
   * @returns {Object} The result of delete operation
   */
  deletePasswordResetToken: async function (token) {
    const query = `
    DELETE FROM cmd_auth_tokens
    WHERE token = ? AND device_info = 'PASSWORD_RESET';
  `;
    return db.mysqlHelpers.runQueryWithParameters(query, token);
  },

  /**
   * This function is responsible for deleting all password reset tokens for a user
   * @name deletePasswordResetTokensByUserId
   * @function
   * @param {Number} userId The user ID
   * @returns {Object} The result of delete operation
   */
  deletePasswordResetTokensByUserId: async function (userId) {
    const query = `
    DELETE FROM cmd_auth_tokens
    WHERE user_id = ? AND device_info = 'PASSWORD_RESET';
  `;
    return db.mysqlHelpers.runQueryWithParameters(query, userId);
  },

  /**
   * This function is responsible for updating user password
   * @name updatePassword
   * @function
   * @param {Number} userId The user ID
   * @param {String} passwordHash The new password hash
   * @returns {Object} The result of update operation
   */
  updatePassword: async function (userId, passwordHash) {
    const query = `
    UPDATE cmd_auth_users 
    SET password_hash = ?, update_stamp = NOW()
    WHERE id = ?;
  `;
    return db.mysqlHelpers.runQueryWithParameters(query, passwordHash, userId);
  },

  /**
   * This function is responsible for inserting password reset log
   * @name insertPasswordResetLog
   * @function
   * @param {Number} userId The user ID
   * @param {String} status The reset status
   * @param {String} ipAddress The IP address
   * @returns {Object} The result of insert operation
   */
  insertPasswordResetLog: async function (userId, status, ipAddress) {
    const query = `
    INSERT INTO cmd_auth_logs 
      (user_id, login_time, ip_address, status, creation_stamp)
    VALUES (?, NOW(), ?, ?, NOW());
  `;
    return db.mysqlHelpers.runQueryWithParameters(
      query,
      userId,
      ipAddress,
      status
    );
  },

  /**
   * This function is responsible for cleaning up expired password reset tokens
   * @name deleteExpiredResetTokens
   * @function
   * @returns {Object} The result of delete operation
   */
  deleteExpiredResetTokens: async function () {
    const query = `
    DELETE FROM cmd_auth_tokens
    WHERE device_info = 'PASSWORD_RESET' AND expires_at < NOW();
  `;
    return db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for fetching all users
   * @name getAllUsers
   * @function
   * @returns {Object[]} The array of user objects
   */
  getAllUsers: async function () {
    const query = `
   SELECT 
    u.id,
    u.name,
    u.contact,
    u.designation,
    u.user_type,
    a.username,
    a.password_hash,
    u.location_name
FROM cmd_users u
JOIN cmd_auth_users a 
    ON u.id = a.user_id
WHERE u.status = 1
ORDER BY u.id DESC;
    `;

    return await db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for updating user by ID
   * @name updateUserById
   * @function
   * @param {Number} id The user ID
   * @param {String} name The user name
   * @param {String} contact The user contact
   * @param {String} designation The user designation
   * @param {String} user_type The user type
   * @param {String} location_name The location name
   * @returns {Object} The result of update operation
   */
  updateUserById: async function (
    id,
    name,
    contact,
    designation,
    user_type,
    location_name
  ) {
    const query = `
      UPDATE cmd_users
      SET 
        name = ?,
        contact = ?,
        designation = ?,
        user_type = ?,
        location_name = ?,
        update_stamp = NOW()
      WHERE id = ?
    `;

    const queryParams = [name, contact, designation, user_type, location_name, id];
    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      ...queryParams
    );
    return result;
  },

  updateUserandStatus: async function(userId, status) {
  const query = `
    UPDATE cmd_users
    SET status = ?,
        update_stamp = NOW()
    WHERE id = ?
  `
const queryParams = [status, userId];
const result = await db.mysqlHelpers.runQueryWithParameters(query, ...queryParams);

  return result
},


// Save or re-activate a mobile device token for push notifications
  upsertDeviceToken: async function (userId, deviceToken, platform) {
    // First, deactivate any other active tokens for this user
    const deactivateQuery = `
      UPDATE cmd_user_device_tokens
      SET is_active = 0, update_stamp = NOW()
      WHERE user_id = ? AND device_token != ?;
    `;
    
    await db.mysqlHelpers.runQueryWithParameters(
      deactivateQuery,
      userId,
      deviceToken
    );

    // Then, insert or update the new token
    const query = `
      INSERT INTO cmd_user_device_tokens
        (user_id, device_token, platform, is_active, creation_stamp, update_stamp)
      VALUES (?, ?, ?, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        device_token = VALUES(device_token),
        platform = VALUES(platform),
        is_active = 1,
        update_stamp = NOW();
    `;
    return db.mysqlHelpers.runQueryWithParameters(
      query,
      userId,
      deviceToken,
      platform
    );
  },

  // Deactivate a single device token for a user (logout from a device)
  deactivateDeviceToken: async function (userId, deviceToken) {
    const query = `
      UPDATE cmd_user_device_tokens
      SET is_active = 0, update_stamp = NOW()
      WHERE user_id = ? AND device_token = ?;
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, userId, deviceToken);
  },

  // Fetch active device tokens for a group of users
  getDeviceTokensByUserIds: async function (userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return [];
    }

    const query = `
      SELECT DISTINCT device_token
      FROM cmd_user_device_tokens
      WHERE user_id IN (?)
        AND is_active = 1;
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, userIds);
  },

  // Deactivate invalid/unregistered tokens returned by FCM
  deactivateDeviceTokensByTokens: async function (deviceTokens) {
    if (!Array.isArray(deviceTokens) || deviceTokens.length === 0) {
      return;
    }

    const query = `
      UPDATE cmd_user_device_tokens
      SET is_active = 0, update_stamp = NOW()
      WHERE device_token IN (?);
    `;
    return db.mysqlHelpers.runQueryWithParameters(query, deviceTokens);
  },

  // Get users to notify; optionally exclude the actor
  getNotificationRecipients: async function (excludeUserId) {
    let query = `
      SELECT u.id, u.name, au.username, au.auth_role
      FROM cmd_users u
      JOIN cmd_auth_users au ON u.id = au.user_id
    `;

    const parameters = [];
    if (excludeUserId !== undefined && excludeUserId !== null) {
      query += ` WHERE u.id != ?`;
      parameters.push(excludeUserId);
    }

    query += ` ORDER BY u.id ASC;`;
    return db.mysqlHelpers.runQueryWithParameters(query, ...parameters);
  },

  
};
