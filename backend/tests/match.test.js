const request = require('supertest')
const express = require('express')
const cors = require('cors')
const pointsTableRoutes = require('../routes/pointsTableRoutes')
const matchRoutes = require('../routes/matchRoutes')
const errorHandler = require('../middleware/errorHandler')

// Create test app
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/points-table', pointsTableRoutes)
app.use('/api/match', matchRoutes)
app.use(errorHandler)

describe('Cricket NRR Calculator Tests', () => {
  
  // Test 1: Get Points Table
  test('Should get points table with 5 teams', async () => {
    const response = await request(app).get('/api/points-table')
    
    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toBeInstanceOf(Array)
    expect(response.body.data.length).toBe(5)
  })
  
  // Test 2: Q-1a - Rajasthan Royals batting first, score 120 vs Delhi Capitals
  test('Q-1a: RR bat first, score 120, want 3rd position vs DC', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        yourTeam: 'Rajasthan Royals',
        oppositionTeam: 'Delhi Capitals',
        overs: 20,
        desiredPosition: 3,
        tossResult: 'Batting First',
        runs: 120
      })
    
    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.scenario).toBe('Batting First')
    expect(response.body.data.restrictBetween).toHaveProperty('min')
    expect(response.body.data.restrictBetween).toHaveProperty('max')
    expect(response.body.data.nrrRange).toHaveProperty('min')
    expect(response.body.data.nrrRange).toHaveProperty('max')
    
    console.log('\nTest Q-1a Output:')
    console.log(response.body.data.output)
  })
  
  // Test 3: Q-1b - Delhi Capitals bat first, score 119, RR needs to chase
  test('Q-1b: DC bat first, score 119, RR want 3rd position', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        yourTeam: 'Rajasthan Royals',
        oppositionTeam: 'Delhi Capitals',
        overs: 20,
        desiredPosition: 3,
        tossResult: 'Bowling First',
        runs: 119
      })
    
    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.scenario).toBe('Bowling First')
    expect(response.body.data.chaseBetween).toHaveProperty('min')
    expect(response.body.data.chaseBetween).toHaveProperty('max')
    expect(response.body.data.nrrRange).toHaveProperty('min')
    expect(response.body.data.nrrRange).toHaveProperty('max')
    
    console.log('\nTest Q-1b Output:')
    console.log(response.body.data.output)
  })
  
  // Test 4: Q-2c - RR bat first, score 80 vs RCB
  test('Q-2c: RR bat first, score 80, want 3rd position vs RCB', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        yourTeam: 'Rajasthan Royals',
        oppositionTeam: 'Royal Challengers Bangalore',
        overs: 20,
        desiredPosition: 3,
        tossResult: 'Batting First',
        runs: 80
      })
    
    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.restrictBetween).toHaveProperty('min')
    expect(response.body.data.restrictBetween).toHaveProperty('max')
    
    console.log('\nTest Q-2c Output:')
    console.log(response.body.data.output)
  })
  
  // Test 5: Q-2d - RCB bat first, score 79, RR needs to chase
  test('Q-2d: RCB bat first, score 79, RR want 3rd position', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        yourTeam: 'Rajasthan Royals',
        oppositionTeam: 'Royal Challengers Bangalore',
        overs: 20,
        desiredPosition: 3,
        tossResult: 'Bowling First',
        runs: 79
      })
    
    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.chaseBetween).toHaveProperty('min')
    expect(response.body.data.chaseBetween).toHaveProperty('max')
    
    console.log('\nTest Q-2d Output:')
    console.log(response.body.data.output)
  })
  
  // Test 6: Missing fields validation
  test('Should return error when fields are missing', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        yourTeam: 'Rajasthan Royals',
        overs: 20
      })
    
    expect(response.statusCode).toBe(400)
  })
  
  // Test 7: Invalid team name
  test('Should return error for invalid team', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({
        yourTeam: 'Invalid Team',
        oppositionTeam: 'Delhi Capitals',
        overs: 20,
        desiredPosition: 3,
        tossResult: 'Batting First',
        runs: 120
      })
    
    expect(response.statusCode).toBe(404)
  })
  
  // Test 8: Points table structure
  test('Should have correct points table structure', async () => {
    const response = await request(app).get('/api/points-table')
    const firstTeam = response.body.data[0]
    
    expect(firstTeam).toHaveProperty('position')
    expect(firstTeam).toHaveProperty('team')
    expect(firstTeam).toHaveProperty('matches')
    expect(firstTeam).toHaveProperty('won')
    expect(firstTeam).toHaveProperty('lost')
    expect(firstTeam).toHaveProperty('nrr')
    expect(firstTeam).toHaveProperty('points')
    expect(firstTeam).toHaveProperty('runsFor')
    expect(firstTeam).toHaveProperty('oversFor')
    expect(firstTeam).toHaveProperty('runsAgainst')
    expect(firstTeam).toHaveProperty('oversAgainst')
  })
})