const { mysqlHelpers } = require('../../../model/db')
const { InferenceClient } = require("@huggingface/inference");






module.exports = {
  





  

// Api for movement of machine   first get machine details using barcode and then create machine in or machine out entry based on the movement type

getMachineByBarcode: async function (barcode) {
  try {
    console.log('=== GET MACHINE BY BARCODE START ===');
    console.log('Getting machine by barcode:', barcode);

    const query = `
      SELECT 
  m.id,
  m.machine_code,
  m.machine_name,
  m.machine_type,
  m.machine_model,
  m.machine_make,
  m.barcode,
  m.location,
  sb.batch_number,
  m.specialization
FROM cmd_machines m
LEFT JOIN stitching_batches sb  
  ON m.location = sb.location 
  AND sb.status = 'active'
WHERE m.barcode = ?
ORDER BY sb.creation_stamp DESC
LIMIT 1;
    `;

    console.log('Get machine by barcode query:', query);
    console.log('Get machine by barcode parameters:', barcode);

    const result = await mysqlHelpers.runQueryWithParameters(query, barcode);

    console.log('Get machine by barcode result:', result);
    console.log('=== GET MACHINE BY BARCODE END ===');

    return result;
  } catch (error) {
    console.error('Error in getMachineByBarcode:', error);
    throw error;
  }
},







createFactoryMovement: async function(data){
console.log('Creating machine movement with data:', data);
const query = `

INSERT INTO cmd_factory_in_out
(
 machine_id,
 mc_type,
 mc_model,
 mc_make,
 location_name,
 transaction_type,
 created_by,
 created_by_name,
 barcode,
 created_at,
 org_id,
 specialization
)

SELECT
 ?,
 ?,
 ?,
 ?,
 ?,
 ?,
 ?,
 (SELECT u.name FROM cmd_users u WHERE u.id = ? LIMIT 1),
 ?,
 NOW(),
 ?,
 ?
WHERE (
 (
   ? = 'IN'
   AND COALESCE(
     (
       SELECT f.transaction_type
       FROM cmd_factory_in_out f
       WHERE f.machine_id = ?
       ORDER BY f.id DESC
       LIMIT 1
     ),
     'OUT'
   ) = 'OUT'
 )
 OR
 (
   ? = 'OUT'
   AND (
     SELECT f.transaction_type
     FROM cmd_factory_in_out f
     WHERE f.machine_id = ?
     ORDER BY f.id DESC
     LIMIT 1
   ) = 'IN'
   AND (
     SELECT f.location_name
     FROM cmd_factory_in_out f
     WHERE f.machine_id = ?
     ORDER BY f.id DESC
     LIMIT 1
   ) = ?
   AND (
     SELECT io.transaction_type
     FROM cmd_machine_inward_outward io
     WHERE io.machine_id = ?
     ORDER BY io.id DESC
     LIMIT 1
   ) = 'OUTWARD'
   AND (
     SELECT io.location_name
     FROM cmd_machine_inward_outward io
     WHERE io.machine_id = ?
     ORDER BY io.id DESC
     LIMIT 1
   ) = ?
 )
)

`;
return await mysqlHelpers.runQueryWithParameters(
 query,
 data.machine_id,
 data.mc_type,
 data.mc_model,
 data.mc_make,
 data.location_name,
 data.transaction_type,
 data.created_by,
 data.created_by,
 data.barcode,
 data.org_id,
 data.specialization,
 data.transaction_type,
 data.machine_id,
 data.transaction_type,
 data.machine_id,
 data.machine_id,
 data.location_name,
 data.machine_id,
 data.machine_id,
 data.location_name
);

},



// batch in batch out apis

createMachineMovement: async function(data){
console.log('Creating machine movement with data:', data);
const query = `

INSERT INTO cmd_machine_inward_outward
(
 machine_id,
 mc_type,
 mc_model,
 mc_make,
 location_name,
 batch_id,
 transaction_type,
 created_by,
 created_by_name,
 barcode,
 created_at,
 org_id,
 specialization
)

SELECT
 ?,
 ?,
 ?,
 ?,
 ?,
 ?,
 ?,
 ?,
 (SELECT u.name FROM cmd_users u WHERE u.id = ? LIMIT 1),
 ?,
 NOW(),
 ?,
 ?
WHERE (
 (
   ? = 'INWARD'
   AND COALESCE(
     (
       SELECT io.transaction_type
       FROM cmd_machine_inward_outward io
       WHERE io.machine_id = ?
       ORDER BY io.id DESC
       LIMIT 1
     ),
     'OUTWARD'
   ) = 'OUTWARD'
   AND (
     SELECT f.transaction_type
     FROM cmd_factory_in_out f
     WHERE f.machine_id = ?
     ORDER BY f.id DESC
     LIMIT 1
   ) = 'IN'
   AND (
     SELECT f.location_name
     FROM cmd_factory_in_out f
     WHERE f.machine_id = ?
     ORDER BY f.id DESC
     LIMIT 1
   ) = ?
 )
 OR
 (
   ? = 'OUTWARD'
   AND (
     SELECT io.transaction_type
     FROM cmd_machine_inward_outward io
     WHERE io.machine_id = ?
     ORDER BY io.id DESC
     LIMIT 1
   ) = 'INWARD'
   AND (
     SELECT io.location_name
     FROM cmd_machine_inward_outward io
     WHERE io.machine_id = ?
     ORDER BY io.id DESC
     LIMIT 1
   ) = ?
 )
)

`;

return await mysqlHelpers.runQueryWithParameters(
 query,
 data.machine_id,
 data.mc_type,
 data.mc_model,
 data.mc_make,
 data.location_name,
 data.batch_id,
 data.transaction_type,
 data.created_by,
 data.created_by,
 data.barcode,
 data.org_id,
 data.specialization,
 data.transaction_type,
 data.machine_id,
 data.machine_id,
 data.machine_id,
 data.location_name,
 data.transaction_type,
 data.machine_id,
 data.machine_id,
 data.location_name
);
},

// API,s for factory in out

// factory list api
getFactoryList: async function(location_name){

const query = `
SELECT 
  id,
  mc_type,
  mc_model,
  mc_make,
  transaction_type,
  created_at
FROM cmd_factory_in_out
WHERE location_name = ?
ORDER BY id DESC
`;

return await mysqlHelpers.runQueryWithParameters(query, location_name);

},  




// create New Machine 


/**
   * @name createMachine
   * @description Insert new machine
   */
 createMachine: async function (
  machine_code,
  machine_name,
  entry_datetime,
  machine_type,
  machine_model,
  machine_make,
  manufactured_date,
  organization_name,
  location,
  barcode,
  machine_status,
  specialization
) {

  const query = `
    INSERT INTO cmd_machines
    (
      machine_code,
      machine_name,
      entry_datetime,
      machine_type,
      machine_model,
      machine_make,
      manufactured_date,
      organization_name,
      location,
      barcode,
      machine_status,
      specialization
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const params = [
    machine_code,
    machine_name,
    entry_datetime,
    machine_type,
    machine_model,
    machine_make,
    manufactured_date,
    organization_name,
    location,
    barcode,
    machine_status,
    specialization
  ]

 const result = await mysqlHelpers.runQueryWithParameters(query, ...params)

  return result.insertId
},




// MACHINE MASTER DATA & OTHER FUNCTIONS
  /**
   * Get all machines with service location
   */
 getAllMachines: async function (barcode) {
 console.log('Getting all machines with barcode filter:', barcode);
 const query = `
    SELECT
      m.id,
      m.machine_code,
      m.machine_name,
      m.machine_model,
      m.machine_type,
      m.machine_make,
      m.barcode,
      io.batch_id,
      m.machine_status,
      m.location as machine_location_fk,
      sl.location_name as location,
      sl.location_type,
      t.last_maintenance_date

    FROM cmd_machines m

    LEFT JOIN (
        SELECT machine_id,
               MAX(performed_at) AS last_maintenance_date
        FROM cmd_tpm_maintenance
        GROUP BY machine_id
    ) t
      ON m.id = t.machine_id

    LEFT JOIN (
        SELECT io1.machine_id, io1.batch_id
        FROM cmd_machine_inward_outward io1
        INNER JOIN (
          SELECT machine_id, MAX(id) AS max_id
          FROM cmd_machine_inward_outward
          GROUP BY machine_id
        ) io2
          ON io1.machine_id = io2.machine_id
         AND io1.id = io2.max_id
    ) io
      ON m.id = io.machine_id

    LEFT JOIN service_locations sl
      ON m.location = sl.location

    ${barcode ? 'WHERE m.barcode = ?' : ''}

    ORDER BY m.id DESC
  `

  if (barcode) {
    return await mysqlHelpers.runQueryWithParameters(query, barcode)
  }

  return await mysqlHelpers.runQuery(query)
},




  // issue type reason api

  getAllIssueTypes: async function () {

    const query = `
      SELECT DISTINCT issue_type
      FROM cmd_breakdown_tickets
      WHERE issue_type IS NOT NULL
      ORDER BY issue_type
    `

    const result = await mysqlHelpers.runQuery(query)

    return result.map(row => ({
      issueType: row.issue_type
    }))
  },

// BREAK DOWN TICKETS


createBreakdownRaiseTicket: async (data) => {
  console.log('Creating breakdown raise ticket with data:', data);
  
  const issueType = data.issue_type || data.reason;

  const issueDescription =
    data.issue_description !== undefined
      ? data.issue_description
      : (data.remarks || null);

  const query = `
    INSERT INTO cmd_breakdown_tickets
    (
      ticket_no,
      machine_id,
      specialization,
      mc_type,
      mc_model,
      mc_make,
      mc_qr,
      location_name,
      batch_id,
      issue_type,
      issue_description,
      raised_by,
      machine_status,
      raised_at,
      creation_stamp,
      update_stamp,
      org_id
    )

    SELECT
      CONCAT(
        'T',
        LPAD(
          COALESCE(
            (SELECT MAX(CAST(SUBSTRING(ticket_no,2) AS UNSIGNED))
             FROM cmd_breakdown_tickets),
            0
          ) + 1,
          4,
          '0'
        )
      ),
      m.id,
      m.specialization,
      m.machine_type,
      m.machine_model,
      m.machine_make,
      m.barcode,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      NOW(),
      NOW(),
      NOW(),
      m.organization_name
    FROM cmd_machines m
    WHERE m.id = ?
    LIMIT 1
  `;

  return await mysqlHelpers.runQueryWithParameters(
    query,
    data.location_name,
    data.batch_id,
    issueType,
    issueDescription,
    data.raised_by,
    data.machine_status || 'BREAKDOWN',
    data.machine_id
  );
},

  


getBreakdownAttendTicket: async function() {
  console.log('Getting breakdown attend tickets');
  const query = `
    SELECT
      t.id,
      t.ticket_no,

      CASE
        WHEN t.machine_status = 'BREAKDOWN' THEN 'NEW'
        WHEN t.machine_status = 'IN_PROGRESS' THEN 'IN PROGRESS'
        WHEN t.machine_status = 'COMPLETED' THEN 'COMPLETED'
        ELSE t.machine_status
      END AS status,

      t.raised_at,
      t.location_name,
      t.batch_id,
      t.mc_type,
      t.mc_model,
      t.mc_make,
      t.mc_qr,
      t.issue_type,
      t.issue_description,
      t.specialization,
      u.name AS raised_by_name

    FROM cmd_breakdown_tickets t

    LEFT JOIN cmd_users u
      ON t.raised_by = u.id

    ORDER BY t.raised_at DESC
  `;
  console.log('Breakdown attend tickets query:', query);
  return await mysqlHelpers.runQuery(query);
},

  // get attend ticket details  api 

// getBreakdownAttendTicket:async function() {

//   const query = `
//     SELECT
//       t.id,
//       t.ticket_no,
//       t.machine_status AS status,
//       t.raised_at,
//       t.location_name,
//       t.batch_id,
//       t.mc_type,
//       t.issue_type,
//       t.issue_description,
//       t.specialization,
//       u.name AS raised_by_name

//     FROM cmd_breakdown_tickets t

//     LEFT JOIN cmd_users u
//       ON t.raised_by = u.id

//     WHERE t.machine_status = 'BREAKDOWN'

//     ORDER BY t.raised_at DESC
//   `;

//   return await mysqlHelpers.runQuery(query);
// },

attendTicket: async function(ticketId, attendedBy, actionTaken, remarks, status) {
  console.log('Attending ticket with ID:', ticketId);
  console.log('Attended by:', attendedBy);

  if (status === 'COMPLETED') {
    const updateIncompleteActionQuery = `
      UPDATE cmd_breakdown_ticket_actions
      SET
        attended_by = ?,
        action_taken = ?,
        remarks = ?,
        status = ?,
        attended_at = NOW()
      WHERE ticket_id = ?
        AND status = 'INCOMPLETE'
      ORDER BY attended_at DESC
      LIMIT 1
    `;

    const updateIncompleteActionResult = await mysqlHelpers.runQueryWithParameters(
      updateIncompleteActionQuery,
      attendedBy,
      actionTaken,
      remarks,
      status,
      ticketId
    );

    if (updateIncompleteActionResult.affectedRows === 0) {
      const insertActionQuery = `
        INSERT INTO cmd_breakdown_ticket_actions
        (ticket_id, attended_by, action_taken, remarks, status, attended_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      await mysqlHelpers.runQueryWithParameters(
        insertActionQuery,
        ticketId,
        attendedBy,
        actionTaken,
        remarks,
        status
      );
    }
  } else {
    const insertActionQuery = `
      INSERT INTO cmd_breakdown_ticket_actions
      (ticket_id, attended_by, action_taken, remarks, status, attended_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    await mysqlHelpers.runQueryWithParameters(
      insertActionQuery,
      ticketId,
      attendedBy,
      actionTaken,
      remarks,
      status
    );
  }

  console.log('Updating ticket with ID:', ticketId);
  const machineStatus = status === 'COMPLETED' ? 'CLOSED' : 'BREAKDOWN';

  const updateTicketQuery = `
    UPDATE cmd_breakdown_tickets
    SET machine_status = ?
    WHERE id = ?
  `;

  await mysqlHelpers.runQueryWithParameters(updateTicketQuery, machineStatus, ticketId);
},









acceptTicket: async function(ticketId, userId) {

  const query = `
    UPDATE cmd_breakdown_tickets
    SET machine_status = 'IN_PROGRESS',
        assigned_to = ?
    WHERE id = ?
  `;

  console.log('Accepting ticket with ID:', ticketId);
  return await mysqlHelpers.runQueryWithParameters(
    query,
    userId,
    ticketId
  );
},










  // // send push notification to ticket raiser and assigned user if any when ticket is attended
  // sendTicketAttendedNotification: async function({ actorUserId, ticketId, actionTaken }) {    
  //   const query = `
  //     SELECT
  //       raised_by,
  //       assigned_to AS assignedUserId
  //     FROM cmd_breakdown_tickets
  //     WHERE id = ?
  //   `

  //   const result = await mysqlHelpers.runQueryWithParameters(query, [ticketId])
  //   if (result.length === 0) {
  //     return
  //   }

  //   const { raised_by: raisedByUserId, assignedUserId } = result[0]

  //   if (assignedUserId) {
  //     await mysqlHelpers.runQueryWithParameters(  
  //       `INSERT INTO cmd_notifications (user_id, message, creation_stamp) VALUES (?, ?, NOW())`,
  //       [

  //         assignedUserId, 
  //         `Your assigned ticket ${ticketId} has been attended. Action taken: ${actionTaken}`
  //       ]
  //     )
  //   }

  //   if (raisedByUserId !== actorUserId) { 
  //     await mysqlHelpers.runQueryWithParameters(
  //       `INSERT INTO cmd_notifications (user_id, message, creation_stamp) VALUES (?, ?, NOW())`,
  //       [
  //         raisedByUserId,
  //         `Ticket ${ticketId} has been attended by you. Action taken: ${actionTaken}`
  //       ]
  //     )
  //   }
  // },



// TPM api,s  

getTasksByType: async function (type) {
 console.log('Getting TPM tasks for type:', type);
  const query = `
    SELECT id, task_name, estimated_seconds
    FROM cmd_tpm_tasks
    WHERE maintenance_type = ?
      AND status = 'ACTIVE'
    ORDER BY id
  `

  return await mysqlHelpers.runQueryWithParameters(query, type)
},

// src/models/inventory/repository/cmd.js
submitTpmMaintenance: async function (
  machine_id,
  machine_code,
  machine_name,
  location_name,
  maintenance_type,
  tasks_completed,
  estimated_seconds,
  time_taken_seconds,
  efficiency,
  batch_id,
  remarks,
  performed_by,
  barcode
) {
  try {
    console.log('Submitting TPM maintenance with data:', {
      machine_id,
      machine_code,
      machine_name,
      location_name,
      maintenance_type,
      tasks_completed,
      estimated_seconds,
      time_taken_seconds,
      efficiency,
      batch_id,
      remarks,
      performed_by,
      barcode
    });
    console.log('Submitting TPM maintenance for machine ID:', machine_id);
    const insertQuery = `
      INSERT INTO cmd_tpm_maintenance
      (
        machine_id,
        machine_code,
        machine_name,
        location_name,
        maintenance_type,
        tasks_completed,
        estimated_seconds,
        time_taken_seconds,
        efficiency,
        batch_id,
        remarks,
        performed_by,
        barcode,
        performed_at,
        last_maintenance_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), CURDATE(), 'COMPLETED')
    `;
    console.log('TPM maintenance insert query:', insertQuery);
    const result = await mysqlHelpers.runQueryWithParameters(
      insertQuery,
      machine_id,
      machine_code,
      machine_name,
      location_name,
      maintenance_type,
      tasks_completed ?? 0,
      estimated_seconds ?? 0,
      time_taken_seconds ?? null,
      efficiency ?? null,
      batch_id ?? null,
      remarks ?? null,
      performed_by,
      barcode ?? null
    );
    console.log('TPM maintenance submitted successfully');
    return result;
  } catch (error) {
    console.error('Error submitting TPM maintenance:', error);
    throw error;
  }
},













 getTpmSummary: async function (type) {

    const query = `
      SELECT
        COUNT(*) AS total_tasks,
        SUM(estimated_seconds) AS total_seconds
      FROM cmd_tpm_tasks
      WHERE maintenance_type = ?
        AND status = 'ACTIVE'
    `

    return await mysqlHelpers.runQueryWithParameters(query, type)
  },


  submitTpmMaintenanceTasks: async function (maintenanceId, machineId, tasks) {
  try {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('No maintenance tasks provided');
    }

    const placeholders = tasks.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const params = tasks.flatMap(task => [
      maintenanceId,
      machineId,
      task.task_name,
      task.estimated_seconds ?? null,
      task.actual_seconds ?? null
    ]);

    const query = `
      INSERT INTO cmd_tpm_maintenance_tasks
      (
        maintenance_id,
        machine_id,
        task_name,
        estimated_seconds,
        actual_seconds
      )
      VALUES ${placeholders}
    `;

    console.log('TPM maintenance tasks query:', query);
    console.log('TPM maintenance tasks params:', params);

    return await mysqlHelpers.runQueryWithParameters(query, ...params);
  } catch (error) {
    console.error('Error submitting TPM maintenance tasks:', error);
    throw error;
  }
},








  // getTpmHistory: async function (machineId) {
  //   console.log('Fetching TPM history for machine ID:', machineId);
  //   const query = `
  //     SELECT *
  //     FROM cmd_tpm_maintenance
  //     WHERE machine_id = ?
  //     ORDER BY performed_at DESC
  //   `
  //   console.log('TPM history query:', query);
  //   return await mysqlHelpers.runQueryWithParameters(query, machineId)
  // },
getTpmHistory: async function (machineId) {
  console.log('Fetching TPM history for machine ID:', machineId);

  const query = `
    SELECT
      m.id,
      m.machine_id,
      m.machine_code,
      m.machine_name,
      m.location_name,
      m.maintenance_type,
      m.remarks,
      m.performed_by,
      m.barcode,
      m.performed_at,
      m.last_maintenance_date,
      m.status,
      m.tasks_completed,
      m.estimated_seconds,
      m.time_taken_seconds,
      m.efficiency,

      m.maintenance_type AS title,
      m.performed_at AS completed_at

    FROM cmd_tpm_maintenance m
    WHERE m.machine_id = ?
    ORDER BY m.performed_at DESC
  `;

  console.log('TPM history query:', query);
  return await mysqlHelpers.runQueryWithParameters(query, machineId);
},

//  machine types api 



getMachineTypes: async function () {

  const query = `
    SELECT id, type_name, creation_stamp
    FROM cmd_machine_types
    ORDER BY type_name ASC
  `

  return await mysqlHelpers.runQuery(query)
},



// get machine makes api

getMachineMakes: async function () {

  const query = `
    SELECT id, make_name, creation_stamp
    FROM cmd_machine_makes
    ORDER BY make_name ASC
  `

  return await mysqlHelpers.runQuery(query)
},

// create machine type api 


createMachineType: async function (typeName) {

  const query = `
    INSERT INTO cmd_machine_types (type_name)
    VALUES (?)
  `

  const result = await mysqlHelpers.runQueryWithParameters(query, typeName)

  return result.insertId
},

// create machine make api


createMachineMake: async function (makeName) {

  const query = `
    INSERT INTO cmd_machine_makes (make_name)
    VALUES (?)
  `

  const result = await mysqlHelpers.runQueryWithParameters(query, makeName)

  return result.insertId
},

// ======================= GET SPECIALIZATIONS FROM MACHINES =======================

getSpecializations: async function () {

  const query = `
    SELECT DISTINCT specialization
    FROM cmd_machines
    WHERE specialization IS NOT NULL
      AND TRIM(specialization) <> ''
    ORDER BY specialization ASC
  `;

  return await mysqlHelpers.runQuery(query);
},





  // Last scan api


// src/models/inventory/repository/cmd.js
getScanMachineDetails: async function (barcode) {
  try {
    console.log('=== GET SCAN MACHINE DETAILS START ===');

    // Log incoming data (same format as submitTpmMaintenance)
    console.log('Getting scan machine with data:', {
      barcode
    });

    const query = `
      SELECT
        m.id AS si_no,
        m.machine_type,
        m.machine_model,
        m.machine_make,
        m.barcode AS machine_qr,
        NULL AS machine_age,

        bt.id AS sl_no,
        bt.raised_at AS date,
        sl.location_name AS location,
        bt.batch_id AS batch,
        bt.issue_type AS type_of_issue,
        TIMESTAMPDIFF(
          SECOND,
          bt.raised_at,
          COALESCE(latest_action.attended_at, NOW())
        ) AS bd_time,
        latest_action.attended_by

      FROM cmd_machines m

      LEFT JOIN service_locations sl
        ON m.location = sl.location

      LEFT JOIN cmd_breakdown_tickets bt
        ON bt.machine_id = m.id

      LEFT JOIN (
        SELECT a1.ticket_id, a1.attended_by, a1.attended_at
        FROM cmd_breakdown_ticket_actions a1
        INNER JOIN (
          SELECT ticket_id, MAX(attended_at) AS max_attended_at
          FROM cmd_breakdown_ticket_actions
          GROUP BY ticket_id
        ) a2
          ON a1.ticket_id = a2.ticket_id
         AND a1.attended_at = a2.max_attended_at
      ) latest_action
        ON bt.id = latest_action.ticket_id

      WHERE m.barcode = ?
      ORDER BY bt.raised_at DESC
    `;

    // Log the query and parameters
    console.log('Scan machine details query:', query);
    console.log('Query parameters:', [barcode]);

    // Execute the query
    const result = await mysqlHelpers.runQueryWithParameters(
      query,
      [barcode]
    );

    // Log the result
    console.log('Scan machine details result:', result);

    console.log('=== GET SCAN MACHINE DETAILS END ===');

    return result;
  } catch (error) {
    console.error('Error in getScanMachineDetails:', error);
    throw error;
  }
},







 /**
   * @name getNotifications
   * @description Fetch notifications for a specific user from the cmd_notifications table
   */
  getNotifications: async function (userId) {
    console.log('Fetching notifications for user ID:', userId);
    const query = `
      SELECT id, ticket_id, sent_at, read_at, creation_stamp
      FROM cmd_ticket_notifications
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 50
    `;
    return await mysqlHelpers.runQueryWithParameters(query, userId);
  },




















  /**
   * Lists pending breakdown tickets for Attend Ticket screen.
   * @returns {Promise<any>} Pending ticket list.
   */
  getBreakdownAttendPendingTickets: async () => {
    const query = `
      SELECT
        t.id,
        t.ticket_no,
        t.machine_id,
        t.slno,
        t.mc_type,
        t.mc_model,
        t.mc_make,
        t.mc_qr,
        t.location_id,
        l.location_name,
        t.batch_id,
        t.issue_type AS reason,
        t.issue_description,
        t.raised_by,
        t.assigned_to,
        t.status,
        t.raised_at,
        t.creation_stamp
      FROM cmd.cmd_breakdown_tickets t
      LEFT JOIN cmd.cmd_locations l ON l.id = t.location_id
      WHERE t.status = 'OPEN'
      ORDER BY t.raised_at DESC, t.creation_stamp DESC
    `
    return mysqlHelpers.runQuery(query)
  },

  /**
   * Accepts a breakdown ticket for the logged-in user.
   * @param {object} data - Accept payload.
   * @param {number} data.ticket_id - Ticket ID.
   * @param {number} data.user_id - User accepting ticket.
   * @returns {Promise<any>} Update result.
   */
  acceptBreakdownAttendTicket: async (data) => {
    const assignQuery = `
      UPDATE cmd.cmd_breakdown_tickets
      SET assigned_to = ?, status = 'IN_PROGRESS', update_stamp = NOW()
      WHERE id = ? AND status = 'OPEN'
    `

    const assignResult = await mysqlHelpers.runQueryWithParameters(
      assignQuery,
      data.user_id,
      data.ticket_id
    )

    if (assignResult.affectedRows > 0) {
      const logQuery = `
        INSERT INTO cmd.cmd_ticket_assignment_logs
        (ticket_id, assigned_by, assigned_to, assignment_type, creation_stamp)
        VALUES (?, ?, ?, 'ACCEPT', NOW())
      `
      await mysqlHelpers.runQueryWithParameters(
        logQuery,
        data.ticket_id,
        data.user_id,
        data.user_id
      )
    }

    return assignResult
  },

  /**
   * Gets one breakdown ticket details for Attend Ticket details screen.
   * @param {number} ticketId - Ticket ID.
   * @returns {Promise<any>} Ticket details.
   */
  getBreakdownAttendTicketById: async (ticketId) => {
    const query = `
      SELECT
        t.id,
        t.ticket_no,
        t.machine_id,
        t.slno,
        t.mc_type,
        t.mc_model,
        t.mc_make,
        t.mc_qr,
        t.location_id,
        l.location_name,
        t.batch_id,
        t.issue_type AS reason,
        t.issue_description,
        t.raised_by,
        t.assigned_to,
        t.status,
        t.raised_at,
        t.creation_stamp,
        t.update_stamp
      FROM cmd.cmd_breakdown_tickets t
      LEFT JOIN cmd.cmd_locations l ON l.id = t.location_id
      WHERE t.id = ?
      LIMIT 1
    `
    return mysqlHelpers.runQueryWithParameters(query, ticketId)
  },

  /**
   * Completes an attended breakdown ticket.
   * @param {object} data - Complete payload.
   * @param {number} data.ticket_id - Ticket ID.
   * @param {number} data.user_id - User completing ticket.
   * @param {string} data.action_taken - Action taken text.
   * @param {string} [data.remarks] - Optional remarks.
   * @returns {Promise<any>} Update result.
   */
  completeBreakdownAttendTicket: async (data) => {
    const actionQuery = `
      INSERT INTO cmd.cmd_breakdown_ticket_actions
      (ticket_id, attended_by, action_taken, remarks, attended_at, creation_stamp)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `

    await mysqlHelpers.runQueryWithParameters(
      actionQuery,
      data.ticket_id,
      data.user_id,
      data.action_taken,
      data.remarks || null
    )

    const closeQuery = `
      UPDATE cmd.cmd_breakdown_tickets
      SET status = 'CLOSED', update_stamp = NOW()
      WHERE id = ? AND status IN ('IN_PROGRESS', 'OPEN')
    `

    return mysqlHelpers.runQueryWithParameters(closeQuery, data.ticket_id)
  },


























    // MAYBE USED IN FUTURE - NOT IN USE CURRENTLY






  // /**
  //  * Retrieves all breakdown tickets for a given location.
  //  * @param {number} locationId - The ID of the location.
  //  * @returns {Promise<any>} A list of tickets for the location.
  //  */
  // getBreakdownTicketsByLocation: async (locationId) => {
  //   const query = 'SELECT * FROM cmd.cmd_breakdown_tickets WHERE location_id = ? ORDER BY creation_stamp DESC'
  //   return mysqlHelpers.runQueryWithParameters(query, locationId)
  // },

  // /**
  //  * Retrieves all tickets assigned to a specific user.
  //  * @param {number} userId - The ID of the user.
  //  * @returns {Promise<any>} A list of tickets assigned to the user.
  //  */
  // getTicketsAssignedToUser: async (userId) => {
  //   const query = 'SELECT * FROM cmd.cmd_breakdown_tickets WHERE assigned_to = ? AND status NOT IN ("CLOSED", "REJECTED") ORDER BY update_stamp DESC'
  //   return mysqlHelpers.runQueryWithParameters(query, userId)
  // },

  // /**
  //  * Adds an action to a breakdown ticket.
  //  * @param {object} actionData - The data for the ticket action.
  //  * @param {number} actionData.ticket_id - The ID of the ticket.
  //  * @param {number} actionData.attended_by - The ID of the user performing the action.
  //  * @param {string} actionData.action_taken - The description of the action taken.
  //  * @param {string} actionData.remarks - Any remarks.
  //  * @returns {Promise<any>} The result of the query.
  //  */
  // createTicketAction: async (actionData) => {
  //   const query = `
  //     INSERT INTO cmd.cmd_breakdown_ticket_actions
  //     (ticket_id, attended_by, action_taken, remarks, attended_at, creation_stamp)
  //     VALUES (?, ?, ?, ?, NOW(), NOW())
  //   `
  //   return mysqlHelpers.runQueryWithParameters(
  //     query,
  //     actionData.ticket_id,
  //     actionData.attended_by,
  //     actionData.action_taken,
  //     actionData.remarks
  //   )
  // },

  // /**
  //  * Assigns a ticket to a user and logs the assignment.
  //  * @param {object} assignmentData - The assignment data.
  //  * @param {number} assignmentData.ticket_id - The ID of the ticket.
  //  * @param {number} assignmentData.assigned_to - The ID of the user to assign the ticket to.
  //  * @param {number} assignmentData.assigned_by - The ID of the user making the assignment.
  //  * @returns {Promise<any>} The result of the update query.
  //  */
  // assignTicket: async (assignmentData) => {
  //   const assignQuery = 'UPDATE cmd.cmd_breakdown_tickets SET assigned_to = ?, status = \'IN_PROGRESS\', update_stamp = NOW() WHERE id = ?'
  //   const logQuery = `
  //     INSERT INTO cmd.cmd_ticket_assignment_logs
  //     (ticket_id, assigned_by, assigned_to, assignment_type, creation_stamp)
  //     VALUES (?, ?, ?, 'ASSIGN', NOW())
  //   `
  //   await mysqlHelpers.runQueryWithParameters(
  //     logQuery,
  //     assignmentData.ticket_id,
  //     assignmentData.assigned_by,
  //     assignmentData.assigned_to
  //   )
  //   return mysqlHelpers.runQueryWithParameters(
  //     assignQuery,
  //     assignmentData.assigned_to,
  //     assignmentData.ticket_id
  //   )
  // },

  // /**
  //  * Updates the status of a breakdown ticket.
  //  * @param {number} ticketId - The ID of the ticket to update.
  //  * @param {string} status - The new status.
  //  * @returns {Promise<any>} The result of the query.
  //  */
  // updateTicketStatus: async (ticketId, status) => {
  //   const query = 'UPDATE cmd.cmd_breakdown_tickets SET status = ?, update_stamp = NOW() WHERE id = ?'
  //   return mysqlHelpers.runQueryWithParameters(query, status, ticketId)
  // },









    // MAYBE USED IN FUTURE - NOT IN USE CURRENTLY


   






  


  // send push notification to ticket raiser and assigned user if any when ticket is attended
  sendTicketAttendedNotification: async function({ actorUserId, ticketId, actionTaken }) {    
    const query = `
      SELECT
        raised_by,
        assigned_to AS assignedUserId
      FROM cmd_breakdown_tickets
      WHERE id = ?
    `

    const result = await mysqlHelpers.runQueryWithParameters(query, [ticketId])
    if (result.length === 0) {
      return
    }

    const { raised_by: raisedByUserId, assignedUserId } = result[0]

    if (assignedUserId) {
      await mysqlHelpers.runQueryWithParameters(  
        `INSERT INTO cmd_ticket_notifications (ticket_id, user_id, sent_at, creation_stamp) VALUES (?, ?, NOW(), NOW())`,
        [
          ticketId, // Assuming ticketId is available and relevant for the notification
          assignedUserId
        ]
      )
    }

    if (raisedByUserId !== actorUserId) { 
      await mysqlHelpers.runQueryWithParameters(
        `INSERT INTO cmd_ticket_notifications (ticket_id, user_id, sent_at, creation_stamp) VALUES (?, ?, NOW(), NOW())`,
        [
          ticketId, // Assuming ticketId is available and relevant for the notification
          raisedByUserId
        ]
      )
    }
  },




  // =================================================================
  // == TPM (MAINTENANCE) FUNCTIONS
  // =================================================================

  /**
   * Creates a TPM maintenance log.
   * @param {object} data - The maintenance log data.
   * @param {number} data.machine_id - The ID of the machine.
   * @param {string} data.maintenance_type - The type of maintenance (e.g., DAILY, WEEKLY).
   * @param {string} data.remarks - Any remarks.
   * @param {number} data.performed_by - The ID of the user who performed the maintenance.
   * @returns {Promise<any>} The result of the query.
   */
  createTpmMaintenanceLog: async (data) => {
    const query = `
      INSERT INTO cmd.cmd_tpm_maintenance
      (machine_id, machine_code, machine_name, location_name, status, last_maintenance_date, maintenance_type, remarks, performed_by, barcode, performed_at, creation_stamp)
      SELECT
        m.id,
        m.machine_code,
        m.machine_name,
        l.location_name,
        'COMPLETED',
        NOW(),
        ?,
        ?,
        ?,
        m.barcode,
        NOW(),
        NOW()
      FROM cmd.cmd_machines m
      JOIN cmd.cmd_locations l ON m.location_id = l.id
      WHERE m.id = ?
    `
    return mysqlHelpers.runQueryWithParameters(
      query,
      data.maintenance_type,
      data.remarks,
      data.performed_by,
      data.machine_id
    )
  },

  /**
   * Retrieves the TPM maintenance history for a machine.
   * @param {number} machineId - The ID of the machine.
   * @returns {Promise<any>} A list of maintenance logs.
   */
  getTpmMaintenanceHistory: async (machineId) => {
    const query = 'SELECT * FROM cmd.cmd_tpm_maintenance WHERE machine_id = ? ORDER BY performed_at DESC'
    return mysqlHelpers.runQueryWithParameters(query, machineId)
  },

  // =================================================================
  // == MASTER DATA FUNCTIONS
  // =================================================================

  /**
   * Retrieves all locations.
   * @returns {Promise<any>} A list of all locations.
   */
  getAllLocations: async () => {
    const query = 'SELECT * FROM cmd.cmd_locations ORDER BY location_name'
    return mysqlHelpers.runQuery(query)
  },

  /**
   * Retrieves all organizations.
   * @returns {Promise<any>} A list of all organizations.
   */
  getAllOrganizations: async () => {
    const query = 'SELECT * FROM cmd.cmd_organization ORDER BY org_name'
    return mysqlHelpers.runQuery(query)
  },

  /**
   * Retrieves all machine makes.
   * @returns {Promise<any>} A list of all machine makes.
   */
  getAllMachineMakes: async () => {
    const query = 'SELECT * FROM cmd.cmd_machine_makes ORDER BY make_name'
    return mysqlHelpers.runQuery(query)
  },

  /**
   * Retrieves all machine types.
   * @returns {Promise<any>} A list of all machine types.
   */
  getAllMachineTypes: async () => {
    const query = 'SELECT * FROM cmd.cmd_machine_types ORDER BY type_name'
    return mysqlHelpers.runQuery(query)
  },

generateText: async function ({ prompt }) {
  try {

    const response = await client.chat.completions.create({
     model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return response;

  } catch (error) {
    console.log("Groq Error:", error);
    throw error;
  }
},




  







}
