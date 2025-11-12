const express = require('express')
const router = express.Router()
const { calculateNRRScenarios } = require('../controllers/matchController')

// Calculate NRR scenarios
router.post('/', calculateNRRScenarios)

module.exports = router