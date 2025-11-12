const PointsTableModel = require('../models/pointstable')

// Helper function to convert overs string to decimal
const oversToDecimal = (overs) => {
  if (typeof overs === 'number') return overs
  if (typeof overs === 'string') {
    const parts = overs.toString().split('.')
    const wholeOvers = parseInt(parts[0]) || 0
    const balls = parseInt(parts[1]) || 0
    return wholeOvers + (balls / 6)
  }
  return 0
}

// Helper function to convert decimal to overs format
const decimalToOvers = (decimal) => {
  const overs = Math.floor(decimal)
  const balls = Math.round((decimal - overs) * 6)
  if (balls === 6) {
    return `${overs + 1}.0`
  }
  return `${overs}.${balls}`
}

// Calculate NRR
const calculateNRR = (runsFor, oversFor, runsAgainst, oversAgainst) => {
  const oversForDecimal = oversToDecimal(oversFor)
  const oversAgainstDecimal = oversToDecimal(oversAgainst)
  
  if (oversForDecimal === 0 || oversAgainstDecimal === 0) {
    return 0
  }
  
  const runRateFor = runsFor / oversForDecimal
  const runRateAgainst = runsAgainst / oversAgainstDecimal
  return runRateFor - runRateAgainst
}

// Get team at desired position
const getTeamAtPosition = (pointsTable, position) => {
  const sortedTable = [...pointsTable].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.nrr - a.nrr
  })
  return sortedTable[position - 1] || null
}

// Calculate scenarios for batting first
const calculateBattingFirstScenarios = (yourTeamData, targetPosition, matchOvers, runsScored, pointsTable) => {
  // Get the team currently at target position
  const targetTeam = getTeamAtPosition(pointsTable, targetPosition)
  if (!targetTeam) {
    return {
      error: true,
      message: `Position ${targetPosition} does not exist in the table`
    }
  }

  // Calculate what NRR we need to achieve
  const targetNRR = targetTeam.nrr

  // Current stats after scoring runs
  const newRunsFor = yourTeamData.runsFor + runsScored
  const newOversFor = oversToDecimal(yourTeamData.oversFor) + matchOvers

  // Find range of runs to restrict opposition to achieve target NRR
  let minRestrictRuns = null
  let maxRestrictRuns = null
  let minNRR = null
  let maxNRR = null

  // Check from 0 runs to runsScored-1 (must win)
  for (let oppRuns = 0; oppRuns < runsScored; oppRuns++) {
    const newRunsAgainst = yourTeamData.runsAgainst + oppRuns
    const newOversAgainst = oversToDecimal(yourTeamData.oversAgainst) + matchOvers
    
    const newNRR = calculateNRR(
      newRunsFor,
      newOversFor,
      newRunsAgainst,
      newOversAgainst
    )
    
    if (newNRR >= targetNRR) {
      if (minRestrictRuns === null) {
        minRestrictRuns = oppRuns
        maxNRR = newNRR
      }
      maxRestrictRuns = oppRuns
      minNRR = newNRR
    }
  }

  if (minRestrictRuns === null) {
    // Cannot achieve target position even with best case
    const bestCaseNRR = calculateNRR(
      newRunsFor,
      newOversFor,
      yourTeamData.runsAgainst,
      oversToDecimal(yourTeamData.oversAgainst) + matchOvers
    )
    
    return {
      minRuns: 0,
      maxRuns: 0,
      minNRR: bestCaseNRR.toFixed(3),
      maxNRR: bestCaseNRR.toFixed(3),
      achievable: false,
      message: `Cannot achieve position ${targetPosition}. Required NRR: ${targetNRR.toFixed(3)}, Best possible NRR: ${bestCaseNRR.toFixed(3)}`
    }
  }

  return {
    minRuns: minRestrictRuns,
    maxRuns: maxRestrictRuns,
    minNRR: minNRR.toFixed(3),
    maxNRR: maxNRR.toFixed(3),
    achievable: true,
    targetNRR: targetNRR.toFixed(3)
  }
}

// Calculate scenarios for bowling first
const calculateBowlingFirstScenarios = (yourTeamData, targetPosition, matchOvers, targetRuns, pointsTable) => {
  // Get the team currently at target position
  const targetTeam = getTeamAtPosition(pointsTable, targetPosition)
  if (!targetTeam) {
    return {
      error: true,
      message: `Position ${targetPosition} does not exist in the table`
    }
  }

  const targetNRR = targetTeam.nrr

  // Must score targetRuns + 1 to win
  const runsToScore = targetRuns + 1
  const newRunsFor = yourTeamData.runsFor + runsToScore
  const newRunsAgainst = yourTeamData.runsAgainst + targetRuns
  const newOversAgainst = oversToDecimal(yourTeamData.oversAgainst) + matchOvers

  // Find range of overs to chase in
  let minOvers = null
  let maxOvers = null
  let minNRR = null
  let maxNRR = null

  // Check different over scenarios (check every ball)
  for (let balls = 1; balls <= matchOvers * 6; balls++) {
    const overs = balls / 6
    const newOversFor = oversToDecimal(yourTeamData.oversFor) + overs
    
    const newNRR = calculateNRR(
      newRunsFor,
      newOversFor,
      newRunsAgainst,
      newOversAgainst
    )
    
    if (newNRR >= targetNRR) {
      if (minOvers === null) {
        minOvers = overs
        maxNRR = newNRR
      }
      maxOvers = overs
      minNRR = newNRR
    }
  }

  if (minOvers === null) {
    // Cannot achieve target position even with best case
    const bestCaseNRR = calculateNRR(
      newRunsFor,
      oversToDecimal(yourTeamData.oversFor) + (1/6), // 1 ball
      newRunsAgainst,
      newOversAgainst
    )
    
    return {
      minOvers: '0.1',
      maxOvers: '0.1',
      minNRR: bestCaseNRR.toFixed(3),
      maxNRR: bestCaseNRR.toFixed(3),
      achievable: false,
      message: `Cannot achieve position ${targetPosition}. Required NRR: ${targetNRR.toFixed(3)}, Best possible NRR: ${bestCaseNRR.toFixed(3)}`
    }
  }

  return {
    minOvers: decimalToOvers(minOvers),
    maxOvers: decimalToOvers(maxOvers),
    minNRR: minNRR.toFixed(3),
    maxNRR: maxNRR.toFixed(3),
    achievable: true,
    targetNRR: targetNRR.toFixed(3)
  }
}

// Main controller function
const calculateNRRScenarios = async (req, res, next) => {
  try {
    const { yourTeam, oppositionTeam, overs, desiredPosition, tossResult, runs } = req.body
    
    // Validate required fields
    if (!yourTeam || !oppositionTeam || !overs || !desiredPosition || !tossResult || runs === undefined) {
      const error = new Error('All fields are required')
      error.statusCode = 400
      throw error
    }

    // Get current points table
    const pointsTable = PointsTableModel.getAll()
    
    // Get team data
    const yourTeamData = pointsTable.find(t => t.team === yourTeam)
    const oppTeamData = pointsTable.find(t => t.team === oppositionTeam)
    
    if (!yourTeamData) {
      const error = new Error(`Team "${yourTeam}" not found in points table`)
      error.statusCode = 404
      throw error
    }
    
    if (!oppTeamData) {
      const error = new Error(`Team "${oppositionTeam}" not found in points table`)
      error.statusCode = 404
      throw error
    }
    
    // Get current position
    const currentPosition = yourTeamData.position
    const desiredPos = parseInt(desiredPosition)
    
    // Get team at desired position for reference
    const targetTeam = getTeamAtPosition(pointsTable, desiredPos)
   
    // After winning this match, your team will have currentPoints + 2
    const pointsAfterWin = yourTeamData.points + 2
    const targetPoints = targetTeam ? targetTeam.points : 0
    
   // it's impossible to reach that position
    if (pointsAfterWin < targetPoints) {
      return res.status(200).json({
        success: true,
        data: {
          scenario: tossResult,
          yourTeam: yourTeam,
          oppositionTeam: oppositionTeam,
          currentPosition: currentPosition,
          desiredPosition: desiredPos,
          currentNRR: yourTeamData.nrr.toFixed(3),
          currentPoints: yourTeamData.points,
          targetTeam: targetTeam ? targetTeam.team : 'N/A',
          targetNRR: targetTeam ? targetTeam.nrr.toFixed(3) : 'N/A',
          targetPoints: targetTeam ? targetTeam.points : 'N/A',
          matchOvers: parseInt(overs),
          runs: parseInt(runs),
          answer: {
            type: tossResult === 'Batting First' ? 'batting_first' : 'bowling_first',
            achievable: false,
            message: `Not Possible! Even after winning, ${yourTeam} will have ${pointsAfterWin} points, but ${targetTeam ? targetTeam.team : 'the team'} at position ${desiredPos} has ${targetPoints} points. You need at least ${targetPoints} points to reach position ${desiredPos}.`,
            formattedAnswer: `Not Possible! Even after winning, ${yourTeam} will have ${pointsAfterWin} points, but ${targetTeam ? targetTeam.team : 'the team'} at position ${desiredPos} has ${targetPoints} points. You need at least ${targetPoints} points to reach position ${desiredPos}.`,
            restrictBetween: { min: 0, max: 0 },
            chaseBetween: { min: '0.0', max: '0.0' },
            nrrRange: { min: '0.000', max: '0.000' }
          }
        },
        message: 'Position not achievable due to insufficient points'
      })
    }
    
    // If we reach here, points are sufficient, proceed with NRR calculation
    let result = {
      scenario: tossResult,
      yourTeam: yourTeam,
      oppositionTeam: oppositionTeam,
      currentPosition: currentPosition,
      desiredPosition: desiredPos,
      currentNRR: yourTeamData.nrr.toFixed(3),
      currentPoints: yourTeamData.points,
      pointsAfterWin: pointsAfterWin,
      targetTeam: targetTeam ? targetTeam.team : 'N/A',
      targetNRR: targetTeam ? targetTeam.nrr.toFixed(3) : 'N/A',
      targetPoints: targetTeam ? targetTeam.points : 'N/A',
      matchOvers: parseInt(overs),
      runs: parseInt(runs)
    }
    
    if (tossResult === 'Batting First') {
      const scenarios = calculateBattingFirstScenarios(
        yourTeamData,
        desiredPos,
        parseInt(overs),
        parseInt(runs),
        pointsTable
      )
      
      if (scenarios.error) {
        const error = new Error(scenarios.message)
        error.statusCode = 400
        throw error
      }
      
      result.answer = {
        type: 'batting_first',
        runsScored: parseInt(runs),
        restrictBetween: {
          min: scenarios.minRuns,
          max: scenarios.maxRuns
        },
        nrrRange: {
          min: scenarios.minNRR,
          max: scenarios.maxNRR
        },
        achievable: scenarios.achievable,
        message: scenarios.message || null,
        formattedAnswer: scenarios.achievable 
          ? `If ${yourTeam} scores ${runs} runs in ${overs} overs, ${yourTeam} needs to restrict ${oppositionTeam} between ${scenarios.minRuns} to ${scenarios.maxRuns} runs in ${overs} overs. Revised NRR of ${yourTeam} will be between ${scenarios.minNRR} to ${scenarios.maxNRR}.`
          : scenarios.message
      }
    } else {
      const scenarios = calculateBowlingFirstScenarios(
        yourTeamData,
        desiredPos,
        parseInt(overs),
        parseInt(runs),
        pointsTable
      )
      
      if (scenarios.error) {
        const error = new Error(scenarios.message)
        error.statusCode = 400
        throw error
      }
      
      result.answer = {
        type: 'bowling_first',
        targetRuns: parseInt(runs),
        chaseBetween: {
          min: scenarios.minOvers,
          max: scenarios.maxOvers
        },
        nrrRange: {
          min: scenarios.minNRR,
          max: scenarios.maxNRR
        },
        achievable: scenarios.achievable,
        message: scenarios.message || null,
        formattedAnswer: scenarios.achievable
          ? `${yourTeam} needs to chase ${parseInt(runs) + 1} runs between ${scenarios.minOvers} and ${scenarios.maxOvers} overs. Revised NRR for ${yourTeam} will be between ${scenarios.minNRR} to ${scenarios.maxNRR}.`
          : scenarios.message
      }
    }
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'NRR scenarios calculated successfully'
    })
    
  } catch (error) {
    next(error)
  }
}

module.exports = {
  calculateNRRScenarios
}