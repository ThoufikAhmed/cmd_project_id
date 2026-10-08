const axios = require('axios')
const isReachable = require('is-reachable')

/**
 * @param {{ ponumber: String, itemno: String, quantity: Number, env: String, location: String }} mirData The data that needs to be sent to the Sage AP server
 */
async function makeRequestToSageServer (mirData) {
  try {
    const stableConnection = await isReachable(process.env.SAGE_AP_HOSTIP + ':9010')
    const backupConnection = await isReachable(process.env.SAGE_AP_HOSTIP_BACKUP + ':9010')
    const stableConnectionBD = await isReachable(process.env.BD_SAGE_AP_HOSTIP + ':9090')
    const ponumber = mirData[0].ponumber
    const poPrefix = ponumber.substring(0, 4) // Extract the first 4 characters (e.g., "IDPO")

    let executableConnection = null
    if (poPrefix === 'IDPO' || poPrefix === 'NJPO' || poPrefix === 'idpo') {
      if (stableConnection === true) {
        executableConnection = process.env.SAGE_AP_HOSTIP
        console.log(`Using stable connection for ID Sage AP: ${executableConnection}`) // Replace with logger.info() if using a logger
      } else if (backupConnection === true) {
        executableConnection = process.env.SAGE_AP_HOSTIP_BACKUP
        console.log(`Using backup connection for ID Sage AP: ${executableConnection}`)
      } else {
        throw new Error('Connection failed for ID Sage AP')
      }

      const response = await axios({
        method: 'POST',
        url: `http://${executableConnection}:9010/sagemir/executeSageMir`,
        data: mirData
      })
      return response.data
    } else if (poPrefix === 'BDDP') {
      if (stableConnectionBD === true) {
        executableConnection = process.env.BD_SAGE_AP_HOSTIP
        console.log(`Using stable connection for BD Sage AP: ${executableConnection}`)
      } else {
        throw new Error('Connection failed for BD Sage AP')
      }

      const response = await axios({
        method: 'POST',
        url: `http://${executableConnection}:9090/sagemir/executeSageMir`,
        data: mirData
      })
      return response.data
    } else {
      throw new Error('Connection failed for BD Sage AP')
    }
  } catch (err) {
    throw Error(err)
  }
}

module.exports = makeRequestToSageServer
