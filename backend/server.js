const express = require('express')
const cors = require('cors')
const app = express()
const PORT =  5000
// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Import routes AFTER creating app
const pointsTableRoutes = require('./routes/pointsTableRoutes')
const matchRoutes = require('./routes/matchRoutes')
const errorHandler = require('./middleware/errorHandler')

// Check if routes are properly imported
console.log('pointsTableRoutes type:', typeof pointsTableRoutes)
console.log('matchRoutes type:', typeof matchRoutes)

// Routes
app.use('/api/points-table', pointsTableRoutes)
app.use('/api/match', matchRoutes)

// Health check route
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

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`http://localhost:${PORT}`)
})

module.exports = app