/**
 * @module utils/getHourIntervalsBetween
 */

/** This function is responsible to return the hour intervals between the start time and end time
   * If there is less than an hour interval, it will return the interval as is
   * @name getBatchScheduleBreakUpTime
   * @function
   * @instance
   * @memberof module:utils/getHourIntervalsBetween
   * @param {String} workStartTime The work start time for batch
   * @param {String} workEndTime The work end time for batch
   * @returns {BatchScheduleBreakUpTime[]} The array of objects {@link module:utils/getHourIntervalsBetween~BatchScheduleBreakUpTime}
   */
/**
   * @inner
   * @typedef {Object} BatchScheduleBreakUpTime
   * @property {String} BatchScheduleBreakUpTime.startTime The break up start time
   * @property {String} BatchScheduleBreakUpTime.endTime The break up end time
   */
function getHourIntervalsBetween (startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':')
  const [endHour, endMinute] = endTime.split(':')

  const startDate = new Date(Date.UTC(0, 0, 0, startHour, startMinute))
  const endDate = new Date(Date.UTC(0, 0, 0, endHour, endMinute))

  let startTimeInMS = startDate.getTime()
  const endTimeInMS = endDate.getTime()

  const timeIntervals = []
  while (startTimeInMS < endTimeInMS) {
    const timeDifference = (endTimeInMS - startTimeInMS) / 60000
    if (timeDifference < 60) {
      //  add whatever the time difference is
      timeIntervals.push({
        startTime: new Date(startTimeInMS),
        endTime: new Date(startTimeInMS + timeDifference * 60 * 1000)
      })
    } else {
      //  add an hour
      timeIntervals.push({
        startTime: new Date(startTimeInMS),
        endTime: new Date(startTimeInMS + 60 * 60 * 1000)
      })
    }
    startTimeInMS += 60 * 60 * 1000
  }

  return timeIntervals.map(({ startTime, endTime }) => {
    const formattedStartTimeHours = startTime.getUTCHours()
    const formattedStartTimeMinutes = startTime.getUTCMinutes()
    let formattedStartTimeAsString = `${formattedStartTimeMinutes}`

    if (formattedStartTimeMinutes < 10) {
      formattedStartTimeAsString = `0${formattedStartTimeMinutes}`
    }

    const formattedEndTimeHours = endTime.getUTCHours()
    const formattedEndTimeMinutes = endTime.getUTCMinutes()
    let formattedEndTimeAsString = `${formattedEndTimeMinutes}`

    if (formattedEndTimeMinutes < 10) {
      formattedEndTimeAsString = `0${formattedEndTimeMinutes}`
    }

    return {
      startTime: `${formattedStartTimeHours}:${formattedStartTimeAsString}`,
      endTime: `${formattedEndTimeHours}:${formattedEndTimeAsString}`
    }
  })
}

module.exports = getHourIntervalsBetween
