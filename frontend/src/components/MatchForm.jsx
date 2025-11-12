import React, { useState, useEffect } from 'react'

const MatchForm = () => {
  const [formData, setFormData] = useState({
    yourTeam: '',
    oppositionTeam: '',
    overs: '',
    desiredPosition: '',
    tossResult: '',
    runs: ''
  })
  
  const [pointsTable, setPointsTable] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nrrResult, setNrrResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const iplTeams = [
    'Chennai Super Kings',
    'Delhi Capitals',
    'Gujarat Titans',
    'Kolkata Knight Riders',
    'Lucknow Super Giants',
    'Mumbai Indians',
    'Punjab Kings',
    'Rajasthan Royals',
    'Royal Challengers Bangalore',
    'Sunrisers Hyderabad'
  ]

  useEffect(() => {
    fetchPointsTable()
  }, [])

  const fetchPointsTable = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/points-table')
      const data = await response.json()
      
      if (data.success) {
        setPointsTable(data.data)
        setError(null)
      } else {
        setError(data.message || 'Failed to fetch points table')
      }
    } catch (error) {
      setError('Failed to connect to server')
      console.error('Error fetching points table:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setNrrResult(data.data)
        setShowResult(true)
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error calculating NRR:', error)
      alert('Failed to calculate NRR scenarios. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTeamAbbreviation = (teamName) => {
    return teamName
      .split(' ')
      .map(word => word[0])
      .join('')
  }

  const closeResultModal = () => {
    setShowResult(false)
    setNrrResult(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">
      {showResult && nrrResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">NRR Calculation Result</h2>
              <button
                onClick={closeResultModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-indigo-900">Match Scenario</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Your Team:</p>
                  <p className="font-bold text-gray-800">{nrrResult.yourTeam}</p>
                </div>
                <div>
                  <p className="text-gray-600">Opposition:</p>
                  <p className="font-bold text-gray-800">{nrrResult.oppositionTeam}</p>
                </div>
                <div>
                  <p className="text-gray-600">Match Overs:</p>
                  <p className="font-bold text-gray-800">{nrrResult.matchOvers} overs</p>
                </div>
                <div>
                  <p className="text-gray-600">Scenario:</p>
                  <p className="font-bold text-gray-800">{nrrResult.scenario}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Position:</p>
                  <p className="font-bold text-gray-800">#{nrrResult.currentPosition}</p>
                </div>
                <div>
                  <p className="text-gray-600">Desired Position:</p>
                  <p className="font-bold text-indigo-600">#{nrrResult.desiredPosition}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Points:</p>
                  <p className="font-bold text-gray-800">{nrrResult.currentPoints} pts</p>
                </div>
                <div>
                  <p className="text-gray-600">Points After Win:</p>
                  <p className="font-bold text-green-600">{nrrResult.pointsAfterWin || nrrResult.currentPoints + 2} pts</p>
                </div>
                <div>
                  <p className="text-gray-600">Target Team Points:</p>
                  <p className="font-bold text-indigo-600">{nrrResult.targetPoints} pts</p>
                </div>
                <div>
                  <p className="text-gray-600">Current NRR:</p>
                  <p className={`font-bold ${parseFloat(nrrResult.currentNRR) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(nrrResult.currentNRR) > 0 ? '+' : ''}{nrrResult.currentNRR}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Target NRR:</p>
                  <p className={`font-bold ${parseFloat(nrrResult.targetNRR) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(nrrResult.targetNRR) > 0 ? '+' : ''}{nrrResult.targetNRR}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-6 mb-6 ${nrrResult.answer.achievable ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                {nrrResult.answer.achievable ? (
                  <>
            
                    <span className="text-green-700">Position Achievable</span>
                  </>
                ) : (
                  <>
            
                    <span className="text-red-700">Position Not Achievable</span>
                  </>
                )}
              </h3>
              
              <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
                <p className="text-gray-800 leading-relaxed text-base">
                  {nrrResult.answer.formattedAnswer}
                </p>
              </div>

              {nrrResult.answer.achievable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nrrResult.scenario === 'Batting First' ? (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Restrict Opposition To:</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {nrrResult.answer.restrictBetween.min} - {nrrResult.answer.restrictBetween.max}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">runs in {nrrResult.matchOvers} overs</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2">Revised NRR Range:</p>
                        <p className="text-2xl font-bold text-green-600">
                          {nrrResult.answer.nrrRange.min} to {nrrResult.answer.nrrRange.max}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2"> Chase In:</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {nrrResult.answer.chaseBetween.min} - {nrrResult.answer.chaseBetween.max}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">overs</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-2"> Revised NRR Range:</p>
                        <p className="text-2xl font-bold text-green-600">
                          {nrrResult.answer.nrrRange.min} to {nrrResult.answer.nrrRange.max}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {!nrrResult.answer.achievable && nrrResult.answer.message && (
                <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
                  <p className="text-sm font-semibold text-red-600 mb-1">Reason:</p>
                  <p className="text-gray-700">{nrrResult.answer.message}</p>
                </div>
              )}
            </div>

            <button
              onClick={closeResultModal}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Cricket NRR Calculator
          </h1>
          
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="yourTeam" className="text-sm font-semibold text-gray-700">
                Your Team *
              </label>
              <select
                id="yourTeam"
                name="yourTeam"
                value={formData.yourTeam}
                onChange={handleChange}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-gray-300 bg-white"
              >
                <option value="">Select Your Team</option>
                {iplTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="oppositionTeam" className="text-sm font-semibold text-gray-700">
                Opposition Team *
              </label>
              <select
                id="oppositionTeam"
                name="oppositionTeam"
                value={formData.oppositionTeam}
                onChange={handleChange}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-gray-300 bg-white"
              >
                <option value="">Select Opposition Team</option>
                {iplTeams
                  .filter(team => team !== formData.yourTeam)
                  .map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="overs" className="text-sm font-semibold text-gray-700">
                How many overs match? *
              </label>
              <select
                id="overs"
                name="overs"
                value={formData.overs}
                onChange={handleChange}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-gray-300 bg-white"
              >
                <option value="">Select Overs</option>
                <option value="5">5 Overs</option>
                <option value="10">10 Overs</option>
                <option value="20">20 Overs</option>
                <option value="50">50 Overs</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="desiredPosition" className="text-sm font-semibold text-gray-700">
                Desired Position for Your Team in Points Table *
              </label>
              <input
                type="number"
                id="desiredPosition"
                name="desiredPosition"
                value={formData.desiredPosition}
                onChange={handleChange}
                min="1"
                max="10"
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-gray-300"
                placeholder="Enter position (1-10)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Toss Result *
              </label>
              <div className="flex gap-8 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tossResult"
                    value="Batting First"
                    checked={formData.tossResult === 'Batting First'}
                    onChange={handleChange}
                    required
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">Batting First</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tossResult"
                    value="Bowling First"
                    checked={formData.tossResult === 'Bowling First'}
                    onChange={handleChange}
                    required
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">Bowling First</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="runs" className="text-sm font-semibold text-gray-700">
                {formData.tossResult === 'Batting First' 
                  ? 'Runs Scored (Batting First) *' 
                  : formData.tossResult === 'Bowling First'
                  ? 'Runs to Chase (Bowling First) *'
                  : 'Runs *'}
              </label>
              <input
                type="number"
                id="runs"
                name="runs"
                value={formData.runs}
                onChange={handleChange}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-gray-300"
                placeholder="Enter runs"
                min="0"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating...' : 'Calculate NRR Scenarios'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            IPL 2022 Points Table
          </h2>
          
          {loading && !showResult ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Pos</th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Team</th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">M</th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">W</th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">L</th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">NRR</th>
                    <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pointsTable.map((team) => (
                    <tr
                      key={team.team}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700">{team.position}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{getTeamAbbreviation(team.team)}</td>
                      <td className="px-4 py-3 text-gray-600">{team.matches}</td>
                      <td className="px-4 py-3 text-gray-600">{team.won}</td>
                      <td className="px-4 py-3 text-gray-600">{team.lost}</td>
                      <td className={`px-4 py-3 font-semibold ${team.nrr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {team.nrr > 0 ? '+' : ''}{team.nrr.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-600 text-lg">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MatchForm