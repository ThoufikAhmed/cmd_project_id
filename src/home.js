/**
 * Express router providing a root route
 * @module routers/home
 */

const express = require('express')
const router = express.Router()

/**
 * Root route returns generic Hello World
 * @function
 * @name get/
 * @memberof module:routers/home
 */
router.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = router
