/**
 * @module repository/breakdown
 */ 
const db = require("../../../model/db");

module.exports = {
getBreakdownTicketDetails: async function () {
  const query = `
    SELECT 
        cmd_breakdown_tickets.id AS ticket_id,
        cmd_breakdown_tickets.ticket_no,
        cmd_breakdown_tickets.raised_by AS raised_by_id,
        cmd_users.name AS raised_by_name,
        cmd_machines.machine_code,
        cmd_machines.machine_name,
        cmd_breakdown_tickets.location_name AS location,
        cmd_breakdown_tickets.raised_at AS ticket_raised_time,
        cmd_breakdown_tickets.batch_id AS batchid

    FROM cmd_breakdown_tickets

    LEFT JOIN cmd_users
        ON cmd_breakdown_tickets.raised_by = cmd_users.id

    LEFT JOIN cmd_machines
        ON cmd_breakdown_tickets.machine_id = cmd_machines.id

    ORDER BY cmd_breakdown_tickets.raised_at DESC
  `;

  // console.log("Executing Query:", query);
  return await db.mysqlHelpers.runQuery(query);
},
getCompletedAndAttendedTickets: async function () {
  const query = `
   SELECT 


    cmd_breakdown_tickets.raised_by AS raised_by_id,
    raised_user.name AS raised_by_name,

    cmd_breakdown_ticket_actions.attended_by AS attended_by_id,
    attended_user.name AS attended_by_name,

    cmd_breakdown_ticket_actions.status,
    cmd_breakdown_ticket_actions.attended_at,

    cmd_breakdown_tickets.location_name,
    cmd_breakdown_tickets.batch_id,

    cmd_machines.id AS machine_id,
    cmd_machines.machine_name

FROM cmd_breakdown_ticket_actions

LEFT JOIN cmd_breakdown_tickets
    ON cmd_breakdown_ticket_actions.ticket_id = cmd_breakdown_tickets.id

LEFT JOIN cmd_users AS attended_user
    ON cmd_breakdown_ticket_actions.attended_by = attended_user.id

LEFT JOIN cmd_users AS raised_user
    ON cmd_breakdown_tickets.raised_by = raised_user.id

LEFT JOIN cmd_machines
    ON cmd_breakdown_tickets.machine_id = cmd_machines.id;  
  `;

  console.log("Executing Query:", query);
  return await db.mysqlHelpers.runQuery(query);  
},
getPendingTickets: async function () {
  const query = `
    SELECT DISTINCT
    t.id AS ticket_id,
    t.machine_id AS machineId,
    t.ticket_no,
    u1.name AS raised_by_name,
    u1.id AS raisedId,
    u2.name AS attended_by_name,
    u2.id AS attendedId,
    t.mc_type AS machine_name,
    t.mc_model AS machine_model,
    t.location_name,
    t.batch_id,
    t.raised_at,
    a.status AS ticket_status
FROM cmd_breakdown_tickets t

INNER JOIN cmd_breakdown_ticket_actions a
    ON t.id = a.ticket_id

LEFT JOIN cmd_users u1
    ON t.raised_by = u1.id

LEFT JOIN cmd_users u2
    ON a.attended_by = u2.id

WHERE a.status = 'INCOMPLETE'
AND NOT EXISTS (
    SELECT 1
    FROM cmd_ticket_assignment_logs tal
    WHERE tal.ticket_id = t.id
      AND tal.assignment_type = 'PENDING'
);
  `;

  return await db.mysqlHelpers.runQuery(query);
},


getNotAttendedTickets: async function () {
  const query = `
  SELECT
    t.id AS ticket_id,
    t.ticket_no,
    t.raised_by AS raised_by_id,
    u1.name AS raised_by_name,
    t.machine_id,
    t.mc_type AS machine_name,
    t.mc_model AS machine_model,
    t.location_name,
    t.batch_id,
    t.raised_at
FROM cmd_breakdown_tickets t

LEFT JOIN cmd_users u1
    ON u1.id = t.raised_by

WHERE NOT EXISTS (
    SELECT 1
    FROM cmd_breakdown_ticket_actions a
    WHERE a.ticket_id = t.id
)

AND NOT EXISTS (
    SELECT 1
    FROM cmd_ticket_assignment_logs al
    WHERE al.ticket_id = t.id
)

ORDER BY t.raised_at DESC;
  `;

  return await db.mysqlHelpers.runQuery(query);
},
getUserDeviceTokensWithName: async function () {
  const query = `
    SELECT 
      udt.user_id,
      u.name,
      udt.device_token
    FROM cmd_user_device_tokens udt
    JOIN cmd_users u 
      ON udt.user_id = u.id
    WHERE udt.device_token IS NOT NULL
      AND udt.device_token != '';
  `;

  return await db.mysqlHelpers.runQuery(query);
},
getUserByIdWithToken: async function (userId) {
  const query = `
    SELECT 
      u.id AS user_id,
      u.name,
      udt.device_token
    FROM cmd_users u
    LEFT JOIN cmd_user_device_tokens udt
      ON u.id = udt.user_id
      AND udt.device_token IS NOT NULL
      AND udt.device_token != ''
      AND udt.is_active = 1
    WHERE u.id = ?
      AND u.status = 1
    LIMIT 1;
  `;

  const result = await db.mysqlHelpers.runQueryWithParameters(query, [userId]);
  return result[0];
},
  insertNotification: async function (ticket_id, user_id) {
    const query = `
      INSERT INTO cmd_ticket_notifications
        (ticket_id, user_id, sent_at, creation_stamp)
      VALUES (?, ?, NOW(), NOW());
    `;
    const queryParams = [ticket_id, user_id];
    return await db.mysqlHelpers.runQueryWithParameters(query, ...queryParams);
  },
  updateUserDeviceToken: async function (userId, token) {
    // Deactivate a specific token, or all tokens if token is null
    const query = `
      UPDATE cmd_user_device_tokens
      SET is_active = 0
      WHERE user_id = ? AND is_active = 1 ${token ? 'AND device_token = ?' : ''};
    `;
    const params = token ? [userId, token] : [userId];
    return await db.mysqlHelpers.runQueryWithParameters(query, ...params);
  },
 insertAssignmentLog: async function (
  ticket_id,
  assigned_by,
  assigned_to,
  assignment_type
) {
  const query = `
    INSERT INTO cmd_ticket_assignment_logs
      (ticket_id, assigned_by, assigned_to, assignment_type, creation_stamp)
    VALUES (?, ?, ?, ?, NOW());
  `;

  const queryParams = [
    ticket_id,
    assigned_by,
    assigned_to,
    assignment_type
  ];

  return await db.mysqlHelpers.runQueryWithParameters(
    query,
    ...queryParams
  );
},
} ;
