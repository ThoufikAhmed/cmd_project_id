const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const express = require('express')

//  Packaged middleware
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const helmet = require('helmet')

//  Custom middleware
const requestIdGenerator = require('./middleware/requestIdGenerator')
const pickVersion = require('./middleware/pickVersion')
const runVersion = require('./middleware/runVersion')
const error = require('./middleware/error')
const auth = require('./middleware/auth')
console.log('auth', auth)
const morganFormatter = require('./middleware/morganFormatter')

//  Util packages
const logger = require('./utils/logger')
const envConfig = require('./utils/envConfig')

const app = express()
const homeRoute = require('./home')
// caching

// var cacheService = require('express-api-cache')
// var cache = cacheService.cache

// Change morgan date format.
morgan.token('date', () => {
  return new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
})

// Remove token from request query parameter using morgan URL
morgan.token('url', (req) => {
  if (req.url.includes('&token')) {
    return req.url.substring(0, req.url.indexOf('&token'))
  } else { return req.url }
})

morgan.token('request-id', (res) => {
  return res.locals.requestId
})

app.use(helmet())
app.use(cors({
  origin: "*", // ✅ for development (Expo needs this)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: 1024 * 1024 * 10
}))
app.use(bodyParser.json({ limit: 1024 * 1024 * 10 }))
app.use(requestIdGenerator)
app.use(morgan(morganFormatter, { stream: logger.stream }))
// app.use((req, res, next) => {
//   console.log('Request body:', req.body);
//   next();
// });
// app.use('/', homeRoute)
// app.use('/service', auth.jwtCheck, pickVersion, runVersion)

app.use('/', homeRoute)
app.use('/service', pickVersion, runVersion)

app.use('/authentication', pickVersion, runVersion)

app.use('/inventory', pickVersion, runVersion)

app.use('/machinesdata', pickVersion, runVersion)
app.use('/breakdowndetails', pickVersion, runVersion)
app.use('/breakdowndetials', pickVersion, runVersion)
app.use('/tpm', pickVersion, runVersion)

app.use(error)

envConfig()

const port = process.env.SERVER_PORT || 8001
// app.listen(port, () => console.log(`Listening to port ${port} `))
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
