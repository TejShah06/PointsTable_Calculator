// models/pointstable.js
const pointsTableData = [
  {
    position: 1,
    team: 'Gujarat Titans',
    matches: 8,
    won: 6,
    lost: 2,
    points: 12,
    nrr: 0.371,
    runsFor: 1345,
    oversFor: '160.0',
    runsAgainst: 1285,
    oversAgainst: '160.0'
  },
  {
    position: 2,
    team: 'Rajasthan Royals',
    matches: 8,
    won: 6,
    lost: 2,
    points: 12,
    nrr: 0.561,
    runsFor: 1462,
    oversFor: '160.0',
    runsAgainst: 1362,
    oversAgainst: '160.0'
  },
  {
    position: 3,
    team: 'Sunrisers Hyderabad',
    matches: 8,
    won: 5,
    lost: 3,
    points: 10,
    nrr: 0.600,
    runsFor: 1330,
    oversFor: '160.0',
    runsAgainst: 1254,
    oversAgainst: '160.0'
  },
  {
    position: 4,
    team: 'Lucknow Super Giants',
    matches: 8,
    won: 5,
    lost: 3,
    points: 10,
    nrr: 0.334,
    runsFor: 1408,
    oversFor: '160.0',
    runsAgainst: 1354,
    oversAgainst: '160.0'
  },
  {
    position: 5,
    team: 'Royal Challengers Bangalore',
    matches: 9,
    won: 5,
    lost: 4,
    points: 10,
    nrr: -0.572,
    runsFor: 1380,
    oversFor: '180.0',
    runsAgainst: 1420,
    oversAgainst: '180.0'
  },
  {
    position: 6,
    team: 'Delhi Capitals',
    matches: 8,
    won: 4,
    lost: 4,
    points: 8,
    nrr: 0.695,
    runsFor: 1405,
    oversFor: '160.0',
    runsAgainst: 1320,
    oversAgainst: '160.0'
  },
  {
    position: 7,
    team: 'Punjab Kings',
    matches: 8,
    won: 4,
    lost: 4,
    points: 8,
    nrr: -0.470,
    runsFor: 1380,
    oversFor: '160.0',
    runsAgainst: 1410,
    oversAgainst: '160.0'
  },
  {
    position: 8,
    team: 'Kolkata Knight Riders',
    matches: 9,
    won: 3,
    lost: 6,
    points: 6,
    nrr: -0.006,
    runsFor: 1390,
    oversFor: '180.0',
    runsAgainst: 1395,
    oversAgainst: '180.0'
  },
  {
    position: 9,
    team: 'Chennai Super Kings',
    matches: 8,
    won: 2,
    lost: 6,
    points: 4,
    nrr: -0.538,
    runsFor: 1360,
    oversFor: '160.0',
    runsAgainst: 1400,
    oversAgainst: '160.0'
  },
  {
    position: 10,
    team: 'Mumbai Indians',
    matches: 8,
    won: 0,
    lost: 8,
    points: 0,
    nrr: -1.000,
    runsFor: 1305,
    oversFor: '160.0',
    runsAgainst: 1420,
    oversAgainst: '160.0'
  }
]
const getAll = () => {
  return pointsTableData
}

const updateAll = (newTable) => {
  // Clear existing data
  pointsTableData.length = 0
  // Add new data
  pointsTableData.push(...newTable)
}

module.exports = {
  getAll,
  updateAll
}