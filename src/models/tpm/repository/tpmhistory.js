const db = require('../../../model/db')

const getMaintenanceByType = async (maintenanceType) => {
  const query = `
  SELECT
    id,
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
    DATE_FORMAT(performed_at, '%Y-%m-%d %H:%i:%s') AS performed_at,
    DATE_FORMAT(last_maintenance_date, '%Y-%m-%d') AS last_maintenance_date,
    status
FROM cmd_tpm_maintenance
WHERE maintenance_type = ?
ORDER BY performed_at DESC;
  `

  return await db.mysqlHelpers.runQueryWithParameters(query, maintenanceType)
}

module.exports = {
  getDailyMaintenance: async function () {
    return await getMaintenanceByType('DAILY')
  },

  getWeeklyMaintenance: async function () {  
    return await getMaintenanceByType('WEEKLY')
  },

  getMonthlyMaintenance: async function () {
    return await getMaintenanceByType('MONTHLY')
  }
}
