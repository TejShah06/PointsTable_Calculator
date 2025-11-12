const express = require('express')
const router = express.Router()
const { getPointsTable } = require('../controllers/pointsTableController')

// Get points table
router.get('/', getPointsTable)

module.exports = router