const express = require('express')
const router = express.Router()
const logoutController = require('../controller/logoutController.js')

router.delete('/',logoutController.handleLogout)

module.exports = router