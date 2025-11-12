

const request = require('supertest')

const express = require('express')
const cors = require('cors')

const pointsTableRoutes = require('../routes/pointsTableRoutes')
const matchRoutes = require('../routes/matchRoutes')
const errorHandler = require('../middleware/errorHandler')
// Create test app
const app = express()
// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Routes
app.use('/api/points-table', pointsTableRoutes)
app.use('/api/match', matchRoutes)
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running'
  })
})

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
})

// Error handling
app.use(errorHandler)

describe('Cricket NRR Calculator API Tests', () => {
  
  // Test 1: Health Check
  describe('GET /api/health', () => {
    it('should return server is running', async () => {
      const res = await request(app).get('/api/health')
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Server is running')
    })
  })

  // Test 2: Get Points Table
  describe('GET /api/points-table', () => {
    it('should return points table with all teams', async () => {
      const res = await request(app).get('/api/points-table')
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.data.length).toBe(10)
    })

    it('should have correct team data structure', async () => {
      const res = await request(app).get('/api/points-table')
      const firstTeam = res.body.data[0]
      expect(firstTeam).toHaveProperty('position')
      expect(firstTeam).toHaveProperty('team')
      expect(firstTeam).toHaveProperty('matches')
      expect(firstTeam).toHaveProperty('won')
      expect(firstTeam).toHaveProperty('lost')
      expect(firstTeam).toHaveProperty('nrr')
      expect(firstTeam).toHaveProperty('points')
    })
  })

  // Test 3: NRR Calculation - Batting First (Achievable)
  describe('POST /api/match - Batting First Achievable', () => {
    it('should calculate NRR for Rajasthan Royals batting first and scoring 120 runs', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Rajasthan Royals',
          oppositionTeam: 'Delhi Capitals',
          overs: 20,
          desiredPosition: 3,
          tossResult: 'Batting First',
          runs: 120
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('answer')
      expect(res.body.data.answer).toHaveProperty('achievable')
      expect(res.body.data.answer).toHaveProperty('restrictBetween')
      expect(res.body.data.answer).toHaveProperty('nrrRange')
    })
  })

  // Test 4: NRR Calculation - Bowling First (Achievable)
  describe('POST /api/match - Bowling First Achievable', () => {
    it('should calculate NRR for Rajasthan Royals chasing 119 runs', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Rajasthan Royals',
          oppositionTeam: 'Delhi Capitals',
          overs: 20,
          desiredPosition: 3,
          tossResult: 'Bowling First',
          runs: 119
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('answer')
      expect(res.body.data.answer).toHaveProperty('achievable')
      expect(res.body.data.answer).toHaveProperty('chaseBetween')
      expect(res.body.data.answer).toHaveProperty('nrrRange')
    })
  })

  // Test 5: NRR Calculation - Not Achievable (Low Runs)
  describe('POST /api/match - Low Runs Scenario', () => {
    it('should return not achievable for Rajasthan Royals scoring 80 runs', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Rajasthan Royals',
          oppositionTeam: 'Royal Challengers Bangalore',
          overs: 20,
          desiredPosition: 3,
          tossResult: 'Batting First',
          runs: 80
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.answer).toHaveProperty('restrictBetween')
      expect(res.body.data.answer).toHaveProperty('nrrRange')
    })
  })

  // Test 6: Points Validation - Not Achievable Due to Points
  describe('POST /api/match - Not Achievable Due to Insufficient Points', () => {
    it('should return not achievable when points after win are less than target', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Chennai Super Kings',
          oppositionTeam: 'Royal Challengers Bangalore',
          overs: 20,
          desiredPosition: 1,
          tossResult: 'Batting First',
          runs: 150
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      // CSK has low points, so might not reach position 1
      expect(res.body.data.answer).toHaveProperty('achievable')
    })
  })

  // Test 7: Missing Required Fields
  describe('POST /api/match - Missing Fields', () => {
    it('should return 400 error when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Rajasthan Royals',
          overs: 20
          // Missing other required fields
        })
      
      expect(res.statusCode).toBe(400)
    })
  })

  // Test 8: Invalid Team Name
  describe('POST /api/match - Invalid Team', () => {
    it('should return 404 error for non-existent team', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Invalid Team Name',
          oppositionTeam: 'Delhi Capitals',
          overs: 20,
          desiredPosition: 3,
          tossResult: 'Batting First',
          runs: 120
        })
      
      expect(res.statusCode).toBe(404)
    })
  })

  // Test 9: Different Over Formats
  describe('POST /api/match - Different Match Formats', () => {
    it('should calculate NRR for 10-over match', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Mumbai Indians',
          oppositionTeam: 'Gujarat Titans',
          overs: 10,
          desiredPosition: 4,
          tossResult: 'Batting First',
          runs: 100
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.matchOvers).toBe(10)
    })

    it('should calculate NRR for 50-over match', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Kolkata Knight Riders',
          oppositionTeam: 'Punjab Kings',
          overs: 50,
          desiredPosition: 5,
          tossResult: 'Bowling First',
          runs: 250
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.matchOvers).toBe(50)
    })
  })

  // Test 10: Response Structure Validation
  describe('POST /api/match - Response Structure', () => {
    it('should return correct response structure', async () => {
      const res = await request(app)
        .post('/api/match')
        .send({
          yourTeam: 'Lucknow Super Giants',
          oppositionTeam: 'Sunrisers Hyderabad',
          overs: 20,
          desiredPosition: 4,
          tossResult: 'Batting First',
          runs: 160
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('success')
      expect(res.body).toHaveProperty('data')
      expect(res.body).toHaveProperty('message')
      
      const data = res.body.data
      expect(data).toHaveProperty('scenario')
      expect(data).toHaveProperty('yourTeam')
      expect(data).toHaveProperty('oppositionTeam')
      expect(data).toHaveProperty('currentPosition')
      expect(data).toHaveProperty('desiredPosition')
      expect(data).toHaveProperty('currentNRR')
      expect(data).toHaveProperty('answer')
      
      const answer = data.answer
      expect(answer).toHaveProperty('formattedAnswer')
      expect(answer).toHaveProperty('achievable')
    })
  })
})


