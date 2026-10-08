const express = require('express')
const router = express.Router()
const data = require('./data')
const addmachine = require('./addmachine')

router.use('/addmachine', addmachine)


router.use('/data', data)



module.exports = router
