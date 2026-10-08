
const express = require('express')
const router = express.Router()
const tpmhistory = require('./tpmhistory')

router.use('/tpmhistory', tpmhistory)



module.exports = router
