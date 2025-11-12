# Cricket NRR Calculator - Setup Instructions

## Prerequisites
- Node.js v14 or higher
- npm or yarn

## Installation Steps

### 1. Extract the ZIP file
Extract `crickheros-submission.zip` to your desired location

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Run Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 5. Run Frontend (New Terminal)
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

### 6. Run Tests
```bash
cd backend
npm test
```

## Expected Output
- Backend: Server running on port 5000
- Frontend: React app on port 3000
- Tests: 8 tests passing

## Troubleshooting
- If port 5000 is busy: Change PORT in .env to 5001
- If npm install fails: Try `npm install --legacy-peer-deps`
- If tests fail: Run `npm test -- --forceExit`
