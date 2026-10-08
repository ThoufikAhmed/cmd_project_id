
const express = require('express')
const router = express.Router()
const breakdown = require('./breakdown')

router.use('/breakdown', breakdown)



module.exports = router
