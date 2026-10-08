// const router = require('express').Router()

const express = require('express')
const router = express.Router()
const auths = require('./auths')

router.use('/auths', auths)



module.exports = router
