# Cricket Heroes Backend API

Backend server for Cricket Heroes application with proper MVC structure.

## Project Structure

```
backend/
├── models/           # Data models
│   ├── PointsTable.js    # Points table model with default data
│   └── Match.js          # Match data model
├── controllers/      # Business logic
│   ├── pointsTableController.js  # Points table operations
│   └── matchController.js        # Match operations
├── middleware/       # Middleware functions
│   ├── errorHandler.js   # Error handling middleware
│   └── validate.js       # Validation middleware
├── routes/          # API routes
│   ├── pointsTableRoutes.js  # Points table routes
│   └── matchRoutes.js        # Match routes
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
# or
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### Points Table
- **GET** `/api/points-table` - Get all teams from points table
- **GET** `/api/points-table/:teamName` - Get specific team by name
- **PUT** `/api/points-table` - Update points table
- **POST** `/api/points-table/reset` - Reset points table to default

### Match
- **POST** `/api/match` - Submit match result

## API Usage Examples

### Get Points Table
```bash
GET http://localhost:5000/api/points-table
```

### Submit Match
```bash
POST http://localhost:5000/api/match
Content-Type: application/json

{
  "yourTeam": "Chennai Super Kings",
  "oppositionTeam": "Royal Challengers Bangalore",
  "overs": 20,
  "desiredPosition": 1,
  "tossResult": "Batting First",
  "runs": 180
}
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Error details"]
}
```

## Dependencies

- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing

