const latestApiVersion = '8.0'

function safeRequire (path) {
  try {
    return require(path)
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') return undefined
    throw err
  }
}


/* Require routes only for latest version */
const serviceLatest = safeRequire(`../v${latestApiVersion}/routes/service`)
// const authenticationLatest = safeRequire(`../v${latestApiVersion}/routes/ authentication`)
const authenticationLatest = safeRequire(`../v${latestApiVersion}/routes/authentication/index.js`)
const machinesdataLatest = safeRequire(`../v${latestApiVersion}/routes/machinesdata`)
const breakdowndetailsLatest = safeRequire(`../v${latestApiVersion}/routes/breakdowndetails`)
const tpmLatest = safeRequire(`../v${latestApiVersion}/routes/tpm`)


console.log('serviceLatest', serviceLatest? 'found':'not found')
console.log('authenticationLatest', authenticationLatest? 'found':'not found')
console.log('machinesdataLatest', machinesdataLatest? 'found':'not found')
console.log('breakdowndetailsLatest', breakdowndetailsLatest? 'found':'not found')
console.log('tpmLatest', tpmLatest? 'found':'not found')

const taggedRouteLatestObject = {
  service: safeRequire(`../v${latestApiVersion}/routes/service`),
  authentication: safeRequire(`../v${latestApiVersion}/routes/authentication/index.js`),
  inventory: safeRequire(`../v${latestApiVersion}/routes/inventory`),
  machinesdata:  safeRequire(`../v${latestApiVersion}/routes/machinesdata`),
  breakdowndetails: safeRequire(`../v${latestApiVersion}/routes/breakdowndetails`),
  breakdowndetials: safeRequire(`../v${latestApiVersion}/routes/breakdowndetails`),
  tpm: safeRequire(`../v${latestApiVersion}/routes/tpm`),
}

module.exports = function (req, res, next) {
  const apiPath = (req.baseUrl || '').split('/')[1]

  try {
    if (Object.prototype.hasOwnProperty.call(taggedRouteLatestObject, apiPath)) {
      res.locals.versionObject = taggedRouteLatestObject[apiPath]
      res.locals.apiVersion = latestApiVersion
    }
    next()
  } catch (ex) {
    next(ex)
  }
}
