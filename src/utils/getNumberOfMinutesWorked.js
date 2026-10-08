/**
 * @module utils/getNumberOfMinutesWorked
 */

/** This function is responsible to return actual work minutes
   * @name getNumberOfMinutesWorked
   * @function
   * @param {String} actualWorkStartTime The calculated actual work start time for batch
   * @param {String} actualWorkEndTime The calculated actual work end time for batch
   * @param {String} actualBreakStartTime The calculated actual break start time for batch
   * @param {String} actualBreakEndTime The calculated actual break end time for batch
   * @returns {Number} The actual work minutes
   */
function getNumberOfMinutesWorked (actualWorkStartTime, actualWorkEndTime, actualBreakStartTime, actualBreakEndTime) {
  // Split string hour parameter from format hh:mm
  const actualWorkStartTimeSplit = actualWorkStartTime.split(':')
  const actualWorkEndTimeSplit = actualWorkEndTime.split(':')
  const actualBreakStartTimeSplit = actualBreakStartTime.split(':')
  const actualBreakEndTimeSplit = actualBreakEndTime.split(':')

  // Convert timeStamp (hh:mm) to dateTimeStamp (dd/mm/yy hh:mm:ss) to get difference in minutes
  const workStartDateToCalculate = new Date(Date.UTC(0, 0, 0, actualWorkStartTimeSplit[0], actualWorkStartTimeSplit[1], 0))
  const workEndDateToCalculate = new Date(Date.UTC(0, 0, 0, actualWorkEndTimeSplit[0], actualWorkEndTimeSplit[1], 0))
  const breakStartDateToCalculate = new Date(Date.UTC(0, 0, 0, actualBreakStartTimeSplit[0], actualBreakStartTimeSplit[1], 0))
  const breakEndDateToCalculate = new Date(Date.UTC(0, 0, 0, actualBreakEndTimeSplit[0], actualBreakEndTimeSplit[1], 0))

  // Get total work and break minutes
  const totalWorkMinutes = Math.floor((workEndDateToCalculate.getTime() - workStartDateToCalculate.getTime()) / 60000)
  const totalBreakMinutes = Math.floor((breakEndDateToCalculate.getTime() - breakStartDateToCalculate.getTime()) / 60000)

  // Get actual work minutes by substracting workMinutes with breakMinutes
  const actualWorkMinutes = totalWorkMinutes - totalBreakMinutes

  return actualWorkMinutes
}

module.exports = getNumberOfMinutesWorked
