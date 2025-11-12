// Validation middleware for match submission
const validateMatch = (req, res, next) => {
  const { yourTeam, oppositionTeam, overs, desiredPosition, tossResult, runs } = req.body

  const errors = []

  if (!yourTeam || typeof yourTeam !== 'string') {
    errors.push('Your team is required and must be a string')
  }

  if (!oppositionTeam || typeof oppositionTeam !== 'string') {
    errors.push('Opposition team is required and must be a string')
  }

  if (yourTeam === oppositionTeam) {
    errors.push('Your team and opposition team cannot be the same')
  }

  if (!overs || isNaN(parseInt(overs)) || parseInt(overs) <= 0) {
    errors.push('Valid overs is required')
  }

  if (!desiredPosition || isNaN(parseInt(desiredPosition)) || 
      parseInt(desiredPosition) < 1 || parseInt(desiredPosition) > 10) {
    errors.push('Desired position must be a number between 1 and 10')
  }

  if (!tossResult || !['Batting First', 'Bowling First'].includes(tossResult)) {
    errors.push('Toss result must be either "Batting First" or "Bowling First"')
  }

  if (runs === undefined || isNaN(parseInt(runs)) || parseInt(runs) < 0) {
    errors.push('Valid runs is required (must be a non-negative number)')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  next()
}

module.exports = {
  validateMatch
}