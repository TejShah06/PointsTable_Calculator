const PointsTableModel = require('../models/pointstable')


const getPointsTable = (req, res, next) => {
  try {
    const table = PointsTableModel.getAll()
    res.status(200).json({
      success: true,
      data: table
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getPointsTable
}