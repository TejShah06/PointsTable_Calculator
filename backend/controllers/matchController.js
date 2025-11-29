const PointsTableModel = require('../models/pointstable')

// Convert overs like "133.1" to decimal
const oversToDecimal = (overs) => {
  if (typeof overs === 'string') {
    const parts = overs.split('.')
    const wholeOvers = parseInt(parts[0]) || 0
    const balls = parseInt(parts[1]) || 0
    return wholeOvers + (balls / 6)
  }
  return overs
}

// Convert decimal back to overs format
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
  if (oversFor === 0 || oversAgainst === 0) return 0
  const runRateFor = runsFor / oversFor
  const runRateAgainst = runsAgainst / oversAgainst
  return runRateFor - runRateAgainst
}

// Get new position after updating points and NRR
const getNewPosition = (pointsTable, yourTeam, newPoints, newNRR) => {
  const updatedTable = pointsTable.map(team => {
    if (team.team === yourTeam) {
      return { ...team, points: newPoints, nrr: newNRR }
    }
    return team
  })
  
  // Sort by points (descending), then by NRR (descending)
  updatedTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.nrr - a.nrr
  })
  
  // Find new position
  const newPosition = updatedTable.findIndex(t => t.team === yourTeam) + 1
  return newPosition
}

// Main function to calculate NRR scenarios
const calculateNRRScenarios = async (req, res, next) => {
  try {
    const { yourTeam, oppositionTeam, overs, desiredPosition, tossResult, runs } = req.body
    
    console.log('Processing NRR Calculation Request...')
    console.log('Your Team:', yourTeam)
    console.log('Opposition:', oppositionTeam)
    console.log('Overs:', overs)
    console.log('Desired Position:', desiredPosition)
    console.log('Toss Result:', tossResult)
    console.log('Runs:', runs)
    
    // Check if all fields are provided
    if (!yourTeam || !oppositionTeam || !overs || !desiredPosition || !tossResult || runs === undefined) {
      const error = new Error('All fields are required')
      error.statusCode = 400
      throw error
    }

    // Get points table
    const pointsTable = PointsTableModel.getAll()
    
    // Find your team and target position team
    const yourTeamData = pointsTable.find(t => t.team === yourTeam)
    const targetTeam = pointsTable[parseInt(desiredPosition) - 1]
    
    if (!yourTeamData) {
      const error = new Error(`Team "${yourTeam}" not found`)
      error.statusCode = 404
      throw error
    }
    
    if (!targetTeam) {
      const error = new Error(`Position ${desiredPosition} not found`)
      error.statusCode = 404
      throw error
    }
    
    const matchOvers = parseInt(overs)
    const runsValue = parseInt(runs)
    const desiredPos = parseInt(desiredPosition)
    
    // Check points first
    const pointsAfterWin = yourTeamData.points + 2
    const targetPoints = targetTeam.points
    
    console.log('Points Analysis:')
    console.log('Current Points:', yourTeamData.points)
    console.log('Points After Win:', pointsAfterWin)
    console.log('Target Position Points:', targetPoints)
    
    // Convert current overs to decimal
    const currentOversFor = oversToDecimal(yourTeamData.oversFor)
    const currentOversAgainst = oversToDecimal(yourTeamData.oversAgainst)
    
    let consoleOutput = []
    
   
    
    // Check if points are sufficient
    if (pointsAfterWin < targetPoints) {
      consoleOutput.push('POSITION NOT ACHIEVABLE')
      consoleOutput.push(`Reason: Even after winning, ${yourTeam} will have ${pointsAfterWin} points, but position ${desiredPos} requires at least ${targetPoints} points.`)
      consoleOutput.push('\n========================================\n')
      
      const fullOutput = consoleOutput.join('\n')
      console.log(fullOutput)
      
      return res.status(200).json({
        success: true,
        achievable: false,
        data: {
          yourTeam,
          oppositionTeam,
          scenario: tossResult,
          currentPosition: yourTeamData.position,
          desiredPosition: desiredPos,
          currentPoints: yourTeamData.points,
          pointsAfterWin: pointsAfterWin,
          targetPoints: targetPoints,
          reason: `Even after winning, ${yourTeam} will have ${pointsAfterWin} points, but position ${desiredPos} requires at least ${targetPoints} points.`,
          output: fullOutput
        }
      })
    }
    
    if (tossResult === 'Batting First') {
      console.log('Calculating Batting First Scenario...')
      
      // Batting first scenario
      const newRunsFor = yourTeamData.runsFor + runsValue
      const newOversFor = currentOversFor + matchOvers
      
      console.log('New Runs For:', newRunsFor)
      console.log('New Overs For:', newOversFor)
      
      let minRuns = null
      let maxRuns = null
      let minNRR = null
      let maxNRR = null
      let scenariosFound = 0
      
      // Find range of runs to restrict opposition
      for (let oppRuns = 0; oppRuns < runsValue; oppRuns++) {
        const newRunsAgainst = yourTeamData.runsAgainst + oppRuns
        const newOversAgainst = currentOversAgainst + matchOvers
        
        const newNRR = calculateNRR(newRunsFor, newOversFor, newRunsAgainst, newOversAgainst)
        
        // Check if this NRR achieves desired position
        const newPosition = getNewPosition(pointsTable, yourTeam, pointsAfterWin, newNRR)
        
        if (newPosition <= desiredPos) {
          scenariosFound++
          if (minRuns === null) {
            minRuns = oppRuns
            maxNRR = newNRR
            console.log(`First valid scenario found at ${oppRuns} runs`)
          }
          maxRuns = oppRuns
          minNRR = newNRR
        }
      }
      
      console.log(`Total valid scenarios found: ${scenariosFound}`)
      
      // Check if position is achievable
      if (minRuns === null || maxRuns === null) {
        consoleOutput.push(' POSITION NOT ACHIEVABLE')
        consoleOutput.push(`Reason: Even with best possible performance, ${yourTeam} cannot reach position ${desiredPos}.`)
        
        // Calculate best case scenario
        const bestCaseNRR = calculateNRR(
          newRunsFor,
          newOversFor,
          yourTeamData.runsAgainst,
          currentOversAgainst + matchOvers
        )
        const bestPosition = getNewPosition(pointsTable, yourTeam, pointsAfterWin, bestCaseNRR)
        
        consoleOutput.push(`Best possible NRR: ${bestCaseNRR.toFixed(3)}`)
        consoleOutput.push(`Best possible position: ${bestPosition}`)
    
        
        const fullOutput = consoleOutput.join('\n')
        console.log(fullOutput)
        
        return res.status(200).json({
          success: true,
          achievable: false,
          data: {
            yourTeam,
            oppositionTeam,
            scenario: 'Batting First',
            currentPosition: yourTeamData.position,
            desiredPosition: desiredPos,
            bestPossibleNRR: bestCaseNRR.toFixed(3),
            bestPossiblePosition: bestPosition,
            reason: `Even with best possible performance, ${yourTeam} cannot reach position ${desiredPos}. Best possible position is ${bestPosition}.`,
            output: fullOutput
          }
        })
      }
      
      // Format output as per assignment
      consoleOutput.push('POSITION ACHIEVABLE')
      consoleOutput.push('')
      consoleOutput.push(`If ${yourTeam} scores ${runsValue} runs in ${matchOvers} overs, ${yourTeam} needs to restrict ${oppositionTeam} between ${minRuns} to ${maxRuns} runs in ${matchOvers} overs.`)
      consoleOutput.push(`Revised NRR of ${yourTeam} will be between ${minNRR.toFixed(3)} to ${maxNRR.toFixed(3)}.`)
      consoleOutput.push('')
     
      
      const fullOutput = consoleOutput.join('\n')
      console.log(fullOutput)
      
      res.status(200).json({
        success: true,
        achievable: true,
        data: {
          yourTeam,
          oppositionTeam,
          scenario: 'Batting First',
          runs: runsValue,
          overs: matchOvers,
          currentPosition: yourTeamData.position,
          desiredPosition: desiredPos,
          restrictBetween: { min: minRuns, max: maxRuns },
          nrrRange: { min: minNRR.toFixed(3), max: maxNRR.toFixed(3) },
          runsRange: `${minRuns} - ${maxRuns} runs`,
          output: fullOutput
        }
      })
      
    } else {
      console.log('Calculating Bowling First Scenario...')
      
      // Bowling first scenario
      const runsToScore = runsValue + 1
      const newRunsFor = yourTeamData.runsFor + runsToScore
      const newRunsAgainst = yourTeamData.runsAgainst + runsValue
      const newOversAgainst = currentOversAgainst + matchOvers
      
      console.log('Runs to Score:', runsToScore)
      console.log('New Runs For:', newRunsFor)
      console.log('New Runs Against:', newRunsAgainst)
      
      let minOvers = null
      let maxOvers = null
      let minNRR = null
      let maxNRR = null
      let scenariosFound = 0
      
      // Check different overs scenarios (ball by ball)
      for (let balls = 1; balls <= matchOvers * 6; balls++) {
        const overs = balls / 6
        const newOversFor = currentOversFor + overs
        
        const newNRR = calculateNRR(newRunsFor, newOversFor, newRunsAgainst, newOversAgainst)
        
        // Check if this NRR achieves desired position
        const newPosition = getNewPosition(pointsTable, yourTeam, pointsAfterWin, newNRR)
        
        if (newPosition <= desiredPos) {
          scenariosFound++
          if (minOvers === null) {
            minOvers = overs
            maxNRR = newNRR
            console.log(`First valid scenario found at ${decimalToOvers(overs)} overs`)
          }
          maxOvers = overs
          minNRR = newNRR
        }
      }
      
      console.log(`Total valid scenarios found: ${scenariosFound}`)
      
      // Check if position is achievable
      if (minOvers === null || maxOvers === null) {
        consoleOutput.push('POSITION NOT ACHIEVABLE')
        consoleOutput.push(`Reason: Even with best possible performance, ${yourTeam} cannot reach position ${desiredPos}.`)
        
        // Calculate best case scenario (chase in 1 ball)
        const bestCaseNRR = calculateNRR(
          newRunsFor,
          currentOversFor + (1/6),
          newRunsAgainst,
          newOversAgainst
        )
        const bestPosition = getNewPosition(pointsTable, yourTeam, pointsAfterWin, bestCaseNRR)
        
        consoleOutput.push(`Best possible NRR: ${bestCaseNRR.toFixed(3)}`)
        consoleOutput.push(`Best possible position: ${bestPosition}`)
       
        const fullOutput = consoleOutput.join('\n')
        console.log(fullOutput)
        
        return res.status(200).json({
          success: true,
          achievable: false,
          data: {
            yourTeam,
            oppositionTeam,
            scenario: 'Bowling First',
            currentPosition: yourTeamData.position,
            desiredPosition: desiredPos,
            bestPossibleNRR: bestCaseNRR.toFixed(3),
            bestPossiblePosition: bestPosition,
            reason: `Even with best possible performance, ${yourTeam} cannot reach position ${desiredPos}. Best possible position is ${bestPosition}.`,
            output: fullOutput
          }
        })
      }
      
      // Format output as per assignment
      consoleOutput.push(' POSITION ACHIEVABLE')
      consoleOutput.push('')
      consoleOutput.push(`${yourTeam} needs to chase ${runsToScore} runs between ${decimalToOvers(minOvers)} and ${decimalToOvers(maxOvers)} overs.`)
      consoleOutput.push(`Revised NRR for ${yourTeam} will be between ${minNRR.toFixed(3)} to ${maxNRR.toFixed(3)}.`)
      
  
      
      const fullOutput = consoleOutput.join('\n')
      console.log(fullOutput)
      
      res.status(200).json({
        success: true,
        achievable: true,
        data: {
          yourTeam,
          oppositionTeam,
          scenario: 'Bowling First',
          runsToChase: runsToScore,
          overs: matchOvers,
          currentPosition: yourTeamData.position,
          desiredPosition: desiredPos,
          chaseBetween: { min: decimalToOvers(minOvers), max: decimalToOvers(maxOvers) },
          nrrRange: { min: minNRR.toFixed(3), max: maxNRR.toFixed(3) },
          oversRange: `${decimalToOvers(minOvers)} - ${decimalToOvers(maxOvers)} overs`,
          output: fullOutput
        }
      })
    }
    
  } catch (error) {
    console.error('Error in calculate:', error)
    next(error)
  }
}

module.exports = {
  calculateNRRScenarios
}