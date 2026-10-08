/**
 * @module repository/data
 */
const db = require("../../../model/db");

module.exports = {
  /**
   * This function is responsible for inserting a new machine type
   * @name insertMachineType
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {String} typeName The name of the machine type to insert
   * @returns {Object} The result of the insert operation
   */
  insertMachineType: async function (typeName) {
    const query = `
      INSERT INTO cmd_machine_types
      (type_name, creation_stamp, update_stamp)
      VALUES (?, NOW(), NOW());
    `;
  
    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      [typeName]
    );

    return result;
  },

  /**
   * This function is responsible for updating a machine type by ID
   * @name updateMachineTypeById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The machine type ID
   * @param {String} typename The new machine type name
   * @returns {Object} The result of the update operation
   */
  updateMachineTypeById: async function (id, typename) {
    const query = `UPDATE cmd_machine_types SET type_name = ? WHERE id = ?`;
    const queryParams = [typename, id];
    
    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      ...queryParams
    );
    
    return result;
  },

  /**
   * This function is responsible for deleting a machine type by ID
   * @name deleteMachineTypeById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The machine type ID to delete
   * @returns {Object} The result of the delete operation
   */
  deleteMachineTypeById: async (id) => {
    const query = `
      DELETE FROM cmd_machine_types
      WHERE id = ?`;
    
    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      [id]
    );

    return result;
  },

  /**
   * This function is responsible for fetching all machine types
   * @name getAllMachineTypes
   * @function
   * @instance
   * @memberof module:repository/data
   * @returns {Object[]} The array of machine types
   */
  getAllMachineTypes: async function () {
    const query = `
      SELECT id, type_name, creation_stamp, update_stamp
      FROM cmd_machine_types
      ORDER BY id DESC
    `;

    return await db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for inserting a new machine make
   * @name insertMachineMake
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {String} makeName The name of the machine make to insert
   * @returns {Object} The result of the insert operation
   */
  insertMachineMake: async function (makeName) {
    const query = `
      INSERT INTO cmd_machine_makes
      (make_name, creation_stamp, update_stamp)
      VALUES (?, NOW(), NOW());
    `;

    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      [makeName]
    );

    return result;
  },

  /**
   * This function is responsible for updating a machine make by ID
   * @name updateMachineMake
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The machine make ID
   * @param {String} makeName The new machine make name
   * @returns {Object} The result of the update operation
   */
  updateMachineMake: async function (id, makeName) {
    const query = `
      UPDATE cmd_machine_makes 
      SET make_name = ? 
      WHERE id = ?
    `;
    
    const queryParams = [makeName, id];

    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      ...queryParams 
    );

    return result;
  },

  /**
   * This function is responsible for deleting a machine make by ID
   * @name deleteMachineMake
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The machine make ID to delete
   * @returns {Object} The result of the delete operation
   */
  deleteMachineMake: async function (id) {
    const query = `
      DELETE FROM cmd_machine_makes 
      WHERE id = ?;
    `;

    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      [id]
    );

    return result;
  },

  /**
   * This function is responsible for fetching all machine makes
   * @name getAllMachineMakes
   * @function
   * @instance
   * @memberof module:repository/data
   * @returns {Object[]} The array of machine makes
   */
  getAllMachineMakes: async function () {
    const query = `
      SELECT id, make_name, creation_stamp, update_stamp
      FROM cmd_machine_makes
      ORDER BY id DESC
    `;

    return await db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for inserting a new organization
   * @name insertOrganization
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {String} orgName The name of the organization to insert
   * @returns {Object} The result of the insert operation
   */
  insertOrganization: async function (orgName) {
    const query = `
      INSERT INTO cmd_organization (org_name, creation_stamp, update_stamp)
      VALUES (?, NOW(), NOW())
    `;

    const result = await db.mysqlHelpers.runQueryWithParameters(
      query,
      [orgName]
    );

    return result;
  },

  /**
   * This function is responsible for fetching all organizations
   * @name getAllOrganizations
   * @function
   * @instance
   * @memberof module:repository/data
   * @returns {Object[]} The array of organizations
   */
  getAllOrganizations: async function () {
    const query = `
      SELECT id, org_name, creation_stamp, update_stamp
      FROM cmd_organization
      ORDER BY id DESC
    `;

    return await db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for updating an organization by ID
   * @name updateOrganizationById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The organization ID
   * @param {String} orgName The new organization name
   * @returns {Object} The result of the update operation
   */
  updateOrganizationById: async function (id, orgName) {
    const query = `
      UPDATE cmd_organization
      SET org_name = ?, update_stamp = NOW()
      WHERE id = ?
    `;

    const queryParams = [orgName, id];

    return await db.mysqlHelpers.runQueryWithParameters(
      query,
      ...queryParams
    );
  },

  /**
   * This function is responsible for deleting an organization by ID
   * @name deleteOrganizationById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The organization ID to delete
   * @returns {Object} The result of the delete operation
   */
  deleteOrganizationById: async function (id) {
    const query = `
      DELETE FROM cmd_organization
      WHERE id = ?
    `;

    return await db.mysqlHelpers.runQueryWithParameters(query, [id]);
  },

  /**
   * This function is responsible for inserting a new location
   * @name insertLocation
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {String} locationName The name of the location to insert
   * @returns {Object} The result of the insert operation
   */
  insertLocation: async function (locationName) {
    const query = `
      INSERT INTO cmd_locations (location_name, creation_stamp, update_stamp)
      VALUES (?, NOW(), NOW())
    `;

    return await db.mysqlHelpers.runQueryWithParameters(
      query,
      [locationName]
    );
  },

  /**
   * This function is responsible for fetching all locations
   * @name getAllLocations
   * @function
   * @instance
   * @memberof module:repository/data
   * @returns {Object[]} The array of locations
   */
  getAllLocations: async function () {
    const query = `
      SELECT id, location_name, creation_stamp, update_stamp
      FROM cmd_locations
      ORDER BY id DESC
    `;

    return await db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for updating a location by ID
   * @name updateLocationById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The location ID
   * @param {String} locationName The new location name
   * @returns {Object} The result of the update operation
   */
 updateLocationById: async function (id, locationName) {
  const query = `
    UPDATE cmd_locations
    SET location_name = ?, update_stamp = NOW()
    WHERE id = ?
  `;

  const queryParams = [locationName, id];

  return await db.mysqlHelpers.runQueryWithParameters(
    query,
    ...queryParams
  );
},

  /**
   * This function is responsible for deleting a location by ID
   * @name deleteLocationById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The location ID to delete
   * @returns {Object} The result of the delete operation
   */
  deleteLocationById: async function (id) {
    const query = `
      DELETE FROM cmd_locations
      WHERE id = ?
    `;

    return await db.mysqlHelpers.runQueryWithParameters(query, [id]);
  },

  /**
   * This function is responsible for inserting a new specialization
   * @name insertSpecialization
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {String} specializationName The name of the specialization to insert
   * @returns {Object} The result of the insert operation
   */
  insertSpecialization: async function (specializationName) {
    const query = `
      INSERT INTO cmd_specialization (specialization, creation_stamp, update_stamp)
      VALUES (?, NOW(), NOW())
    `;

    return await db.mysqlHelpers.runQueryWithParameters(
      query,
      [specializationName]
    );
  },

  /**
   * This function is responsible for fetching all specializations
   * @name getAllSpecializations
   * @function
   * @instance
   * @memberof module:repository/data
   * @returns {Object[]} The array of specializations
   */
  getAllSpecializations: async function () {
    const query = `
      SELECT id, specialization, creation_stamp, update_stamp
      FROM cmd_specialization
      ORDER BY id DESC
    `;

    return await db.mysqlHelpers.runQuery(query);
  },

  /**
   * This function is responsible for fetching a specialization by ID
   * @name getSpecializationById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The specialization ID
   * @returns {Object[]} The specialization object
   */
  getSpecializationById: async function (id) {
    const query = `
      SELECT id, specialization, creation_stamp, update_stamp
      FROM cmd_specialization
      WHERE id = ?
    `;

    return await db.mysqlHelpers.runQueryWithParameters(query, [id]);
  },

  /**
   * This function is responsible for updating a specialization by ID
   * @name updateSpecializationById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The specialization ID
   * @param {String} specializationName The new specialization name
   * @returns {Object} The result of the update operation
   */
updateSpecializationById: async function (id, specializationName) {
  const query = `
    UPDATE cmd_specialization
    SET specialization = ?, update_stamp = NOW()
    WHERE id = ?
  `;

  const queryParams = [specializationName, id];

  return await db.mysqlHelpers.runQueryWithParameters(
    query,
    ...queryParams
  );
},

  /**
   * This function is responsible for deleting a specialization by ID
   * @name deleteSpecializationById
   * @function
   * @instance
   * @memberof module:repository/data
   * @param {number} id The specialization ID to delete
   * @returns {Object} The result of the delete operation
   */
  deleteSpecializationById: async function (id) {
    const query = `
      DELETE FROM cmd_specialization
      WHERE id = ?
    `;

    return await db.mysqlHelpers.runQueryWithParameters(query, [id]);
  },
  insertMachine: async function (data) {
    const query = `
      INSERT INTO cmd_machines (
        machine_code,
        machine_name,
        entry_datetime,
        machine_type,
        machine_model,
        specialization,
        machine_make,
        manufactured_date,
        organization_name,
        location,
        barcode,


        creation_stamp
      )
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?,  ?, NOW())
    `;

    return await db.mysqlHelpers.runQueryWithParameters(
      query,
      data.machine_code,
      data.machine_name,
      data.machine_type,
      data.machine_model,
      data.specialization,
      data.machine_make,
      data.manufactured_date,
      data.organization_name,
      data.location,
      data.barcode
  
    );
  },

  // GET ALL
  getAllMachines: async function () {
    const query = `
      
SELECT
    id,
    machine_code,
    machine_name,
    DATE_FORMAT(manufactured_date,'%Y-%m-%d') AS manufactured_date,
    entry_datetime,
    machine_type,
    machine_model,
    machine_make,
    organization_name,
    location,
    barcode,
    machine_status,
    creation_stamp,
    update_stamp,
    specialization
FROM cmd_machines

    `;

    return await db.mysqlHelpers.runQuery(query);
  },

  

  // GET MULTIPLE IDS
  getMachinesByIds: async function (ids) {
    const query = `
      SELECT *
      FROM cmd_machines
      WHERE id IN (${ids.map(() => "?").join(",")})
    `;

    return await db.mysqlHelpers.runQueryWithParameters(
      query,
      ...ids
    );
  },

  // UPDATE
  updateMachineById: async function (id, data) {
    const query = `
      UPDATE cmd_machines
      SET machine_name = ?,
          machine_type = ?,
          machine_model = ?,
          machine_make = ?,
          manufactured_date = ?,
          organization_name = ?,
          location = ?,
          specialization = ?,
          update_stamp = NOW()
      WHERE id = ?
    `;

    return await db.mysqlHelpers.runQueryWithParameters(
      query,       
      data.machine_name,
      data.machine_type,
      data.machine_model,
      data.machine_make,
      data.manufactured_date,
      data.organization_name,
      data.location,
      data.specialization,
      id
    );
  },

  // DELETE
  deleteMachineById: async function (id) {
    const query = `DELETE FROM cmd_machines WHERE id = ?`;

    return await db.mysqlHelpers.runQueryWithParameters(query, id);
  },

  /**
    * This function is responsible for fetching machine activity from multiple sources
    * @name getMachineActivity
    * @function
    * @instance
    * @memberof module:repository/data
    * @returns {Object[]} The array of machine activities from all sources
    */
    getMachineActivity: async function () {
     const query = `
     SELECT 
  mio.org_id,
  mio.location_name AS location,
  mio.details,
  mio.specialization,
  mio.mc_type AS machine_type,
  mio.mc_model AS machine_model,
  mio.mc_make AS machine_make,
  m.manufactured_date,
  mio.barcode,
    mio.batch_id,
  mio.transaction_type AS activity_type,
  mio.created_at AS activity_date,
  mio.machine_status,
  'INWARD_OUTWARD' AS source_table
FROM cmd_machine_inward_outward mio
LEFT JOIN cmd_machines m ON mio.machine_id = m.id

UNION ALL

SELECT 
  fio.org_id,
  fio.location_name AS location,
  fio.details,
  fio.specialization,
  fio.mc_type AS machine_type,
  fio.mc_model AS machine_model,
  fio.mc_make AS machine_make,
  m.manufactured_date,
  fio.barcode,
  NULL AS batch_id,   -- ✅ FIX HERE
  fio.transaction_type AS activity_type,
  fio.created_at AS activity_date,
  fio.machine_status,
  'FACTORY_IN_OUT' AS source_table
FROM cmd_factory_in_out fio
LEFT JOIN cmd_machines m ON fio.machine_id = m.id

UNION ALL

SELECT 
  bt.org_id,
  bt.location_name AS location,
    bt.details,
  bt.specialization,
  bt.mc_type AS machine_type,
  bt.mc_model AS machine_model,
  bt.mc_make AS machine_make,
  m.manufactured_date,
  bt.mc_qr AS barcode,
  bt.batch_id,
  bt.issue_type AS activity_type,
  bt.raised_at AS activity_date,
  bt.machine_status,
  'BREAKDOWN_TICKET' AS source_table
FROM cmd_breakdown_tickets bt
LEFT JOIN cmd_machines m ON bt.machine_id = m.id

ORDER BY activity_date DESC
     `;
     const result = await db.mysqlHelpers.runQuery(query);
     return result;
    },


    
    getMachineInOutHistory: async function () {
  const query = `
   SELECT
    f.machine_id,
    m.machine_code,
    m.machine_name,
    f.location_name,

    -- Factory Entry
    f.created_at AS factory_in_date,

    -- Factory Exit
    MIN(fo.created_at) AS factory_out_date,

    -- Batch Details
    mi.batch_id,
    mi.created_at AS batch_entry_date,

    -- Batch Exit
    MIN(mo.created_at) AS batch_exit_date

FROM cmd_factory_in_out f

LEFT JOIN cmd_factory_in_out fo
    ON fo.machine_id = f.machine_id
    AND fo.transaction_type = 'OUT'
    AND fo.created_at > f.created_at

LEFT JOIN cmd_machine_inward_outward mi
    ON mi.machine_id = f.machine_id
    AND mi.transaction_type = 'INWARD'
    AND mi.created_at >= f.created_at

LEFT JOIN cmd_machine_inward_outward mo
    ON mo.machine_id = mi.machine_id
    AND mo.transaction_type = 'OUTWARD'
    AND mo.created_at > mi.created_at

LEFT JOIN cmd_machines m
    ON m.id = f.machine_id

WHERE f.transaction_type = 'IN'

GROUP BY
    f.id,
    f.machine_id,
    m.machine_code,
    m.machine_name,
    f.location_name,
    f.created_at,
    mi.batch_id,
    mi.created_at

ORDER BY f.created_at DESC;
  `;
        
  return await db.mysqlHelpers.runQuery(query);
},
// GET ALL
getAllReasons: async () => {
  const query = `
    SELECT * FROM cmd_reason
    ORDER BY id DESC
  `;
  return await db.mysqlHelpers.runQuery(query);
},


// CREATE (POST)
createReason: async (reason) => {
  const query = `
    INSERT INTO cmd_reason (reason)
    VALUES (?)
  `;
  return await db.mysqlHelpers.runQueryWithParameters(query, [reason]);
},

// UPDATE (PUT)
updateReasonById: async (id, reason) => {
  const query = `
    UPDATE cmd_reason
    SET reason = ?
    WHERE id = ?
  `;
  const queryParams = [reason, id];
  return await db.mysqlHelpers.runQueryWithParameters(  query,
    ...queryParams);
},




// DELETE
deleteReasonById: async (id) => {
  const query = `
    DELETE FROM cmd_reason
    WHERE id = ?
  `;
  return await db.mysqlHelpers.runQueryWithParameters(query, [id]);
},

getAllDetails: async () => {
  const query = `
    SELECT * FROM cmd_details
    ORDER BY id DESC
  `;
  return await db.mysqlHelpers.runQuery(query);
},


createDetail: async (details) => {
  const query = `
    INSERT INTO cmd_details (details)
    VALUES (?)
  `;
  return await db.mysqlHelpers.runQueryWithParameters(query, [details]);
},

updateDetailById: async (id, details) => {
  const query = `
    UPDATE cmd_details
    SET details = ?
    WHERE id = ?
  `;
  const queryParams = [details, id];
  return await db.mysqlHelpers.runQueryWithParameters(query, ...queryParams);
},

deleteDetailById: async (id) => {
  const query = `
    DELETE FROM cmd_details
    WHERE id = ?
  `;
  return await db.mysqlHelpers.runQueryWithParameters(query, [id]);
},





  
  getAllTasks: async function () {
    const query = `
      SELECT 
        id,
        maintenance_type,
        task_name,
        estimated_seconds,
        status
      FROM cmd_tpm_tasks
      ORDER BY id DESC;
    `

    return await db.mysqlHelpers.runQueryWithParameters(query)
  },

  
createTask: async (data) => {
  const query = `
    INSERT INTO cmd_tpm_tasks 
    (maintenance_type, task_name, estimated_seconds, status)
    VALUES (?, ?, ?, ?)
  `;

  const queryParams = [
    data.maintenance_type,
    data.task_name,
    data.estimated_seconds,
    data.status || 'ACTIVE'
  ];

  return await db.mysqlHelpers.runQueryWithParameters(query, ...queryParams);
},

updateTaskById: async (id, data) => {
  console.log("Updating task with ID:", id, "and data:", data); // Debug log
  const query = `
    UPDATE cmd_tpm_tasks
    SET 
      maintenance_type = ?,
      task_name = ?,
      estimated_seconds = ?,
      status = ?
    WHERE id = ?
  `;
  const queryParams = [
    data.maintenance_type,
    data.task_name,
    data.estimated_seconds,
    data.status || 'ACTIVE',
    id
  ];
 
  const result = await db.mysqlHelpers.runQueryWithParameters(query, ...queryParams);
console.log("Update Task Result:", result); // Debug log
  return
},

  deleteTask: async function (id) {
    const query = `
      DELETE FROM cmd_tpm_tasks
      WHERE id = ?;
    `

    return await db.mysqlHelpers.runQueryWithParameters(query, [id])
  }

};