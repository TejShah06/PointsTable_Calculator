
const pointsTableData = [
  {
    position: 1,
    team: 'Chennai Super Kings',
    matches: 7,
    won: 5,
    lost: 2,
    points: 10,
    nrr: 0.771,
    runsFor: 1130,
    oversFor: '133.1',
    runsAgainst: 1071,
    oversAgainst: '138.5'
  },
  {
    position: 2,
    team: 'Royal Challengers Bangalore',
    matches: 7,
    won: 4,
    lost: 3,
    points: 8,
    nrr: 0.597,
    runsFor: 1217,
    oversFor: '140',
    runsAgainst: 1066,
    oversAgainst: '131.4'
  },
  {
    position: 3,
    team: 'Delhi Capitals',
    matches: 7,
    won: 4,
    lost: 3,
    points: 8,
    nrr: 0.319,
    runsFor: 1085,
    oversFor: '126',
    runsAgainst: 1136,
    oversAgainst: '137'
  },
  {
    position: 4,
    team: 'Rajasthan Royals',
    matches: 7,
    won: 3,
    lost: 4,
    points: 6,
    nrr: 0.331,
    runsFor: 1066,
    oversFor: '128.2',
    runsAgainst: 1094,
    oversAgainst: '137.1'
  },
  {
    position: 5,
    team: 'Mumbai Indians',
    matches: 8,
    won: 2,
    lost: 6,
    points: 4,
    nrr: -1.75,
    runsFor: 1003,
    oversFor: '155.2',
    runsAgainst: 1134,
    oversAgainst: '138.1'
  }
]

const getAll = () => {
  return pointsTableData
}

module.exports = {
  getAll
}