const router = require('express').Router()
const validate = require('./validate')
const locations = require('./locations')

router.use('/validate', validate)
router.use('/locations', locations)

module.exports = router
