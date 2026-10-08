/**
 * @module utils/getNumberOfHoursToConsiderForDay
 */

/** This function will decide the number of hours to consider for the day
 * If the current date is different from the date passed in, it will fail
   * @name getNumberOfHoursToConsiderForDay
   * @function
   * @param {String} date The formated date yyyymmdd
   * @param {String} workStartTime The work start time for batch
   * @param {String} workEndTime The work end time for batch
   * @param {String} breakStartTime The break start time for batch
   * @param {String} breakEndTime The break end time for batch
   * @returns {BatchActualTimeScheduleDetails} The array of objects {@link module:useCases/analytics/calculateEfficiency~batchActualTimeScheduleDetails}
   */
/**
   * @inner
   * @typedef {Object} BatchActualTimeScheduleDetails
   * @property {String} batchActualTimeScheduleDetails.actualWorkStartTime The calculated actual work start time for batch
   * @property {String} batchActualTimeScheduleDetails.actualWorkEndTime The calculated actual work end time for batch
   * @property {String} batchActualTimeScheduleDetails.actualBreakStartTime The calculated actual break start time for batch
   * @property {String} batchActualTimeScheduleDetails.actualBreakEndTime The calculated actual break end time for batch
   */
function getNumberOfHoursToConsiderForDay (date, workStartTime, workEndTime, breakStartTime, breakEndTime) {
  const presentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  const realTime = `${presentDate.getHours()}:${presentDate.getMinutes()}`

  const year = `${presentDate.getFullYear()}`
  const month = `0${presentDate.getMonth() + 1}`.slice(-2)
  const day = `0${presentDate.getDate()}`.slice(-2)
  const formattePresentdDate = `${year}-${month}-${day}`

  let actualWorkStartTime = null
  let actualWorkEndTime = null
  let actualBreakStartTime = null
  let actualBreakEndTime = null

  /**
     * If parameter date value is not today's date then return default batch schedule same as in function parameters
     */
  if (date !== formattePresentdDate) {
    actualWorkStartTime = workStartTime
    actualWorkEndTime = workEndTime
    actualBreakStartTime = breakStartTime
    actualBreakEndTime = breakEndTime
    return { actualWorkStartTime, actualWorkEndTime, actualBreakStartTime, actualBreakEndTime }
  }

  // return result before break hour
  if (realTime >= workStartTime && realTime <= breakStartTime) {
    actualWorkStartTime = workStartTime
    actualWorkEndTime = realTime
    actualBreakStartTime = '00:00'
    actualBreakEndTime = '00:00'
    return { actualWorkStartTime, actualWorkEndTime, actualBreakStartTime, actualBreakEndTime }
  }

  // return result in break hour
  if (realTime >= breakStartTime && realTime <= breakEndTime) {
    actualWorkStartTime = workStartTime
    actualWorkEndTime = breakStartTime
    actualBreakStartTime = '00:00'
    actualBreakEndTime = '00:00'
    return { actualWorkStartTime, actualWorkEndTime, actualBreakStartTime, actualBreakEndTime }
  }

  // return result after break hour
  if (realTime >= breakEndTime && realTime <= workEndTime) {
    actualWorkStartTime = workStartTime
    actualWorkEndTime = realTime
    actualBreakStartTime = breakStartTime
    actualBreakEndTime = breakEndTime
    return { actualWorkStartTime, actualWorkEndTime, actualBreakStartTime, actualBreakEndTime }
  }
  // return result default as after working hour if above conditions not satisfied
  actualWorkStartTime = workStartTime
  actualWorkEndTime = workEndTime
  actualBreakStartTime = breakStartTime
  actualBreakEndTime = breakEndTime
  return { actualWorkStartTime, actualWorkEndTime, actualBreakStartTime, actualBreakEndTime }
}

module.exports = getNumberOfHoursToConsiderForDay
