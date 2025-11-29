import React, { useState, useEffect } from 'react';

function App() {
  const [formData, setFormData] = useState({
    yourTeam: '',
    oppositionTeam: '',
    overs: '',
    desiredPosition: '',
    tossResult: '',
    runs: ''
  });

  const [pointsTable, setPointsTable] = useState([]);
  const [loading, setLoading] = useState(false);

  const teams = [
    'Chennai Super Kings',
    'Royal Challengers Bangalore',
    'Delhi Capitals',
    'Rajasthan Royals',
    'Mumbai Indians'
  ];

  // Fetch points table on component mount
  useEffect(() => {
    fetchPointsTable();
  }, []);

  const fetchPointsTable = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/points-table');
      const data = await response.json();
      if (data.success) {
        setPointsTable(data.data);
      }
    } catch (error) {
      console.error('Error fetching points table:', error);
      // Fallback data if backend is not running
      setPointsTable([
        {
          position: 1,
          team: 'Chennai Super Kings',
          matches: 7,
          won: 5,
          lost: 2,
          nrr: 0.771,
          runsFor: 1130,
          oversFor: 133.1,
          runsAgainst: 1071,
          oversAgainst: 138.5,
          points: 10
        },
        {
          position: 2,
          team: 'Royal Challengers Bangalore',
          matches: 7,
          won: 4,
          lost: 3,
          nrr: 0.597,
          runsFor: 1217,
          oversFor: 140,
          runsAgainst: 1066,
          oversAgainst: 131.4,
          points: 8
        },
        {
          position: 3,
          team: 'Delhi Capitals',
          matches: 7,
          won: 4,
          lost: 3,
          nrr: 0.319,
          runsFor: 1085,
          oversFor: 126,
          runsAgainst: 1136,
          oversAgainst: 137,
          points: 8
        },
        {
          position: 4,
          team: 'Rajasthan Royals',
          matches: 7,
          won: 3,
          lost: 4,
          nrr: 0.331,
          runsFor: 1066,
          oversFor: 128.2,
          runsAgainst: 1094,
          oversAgainst: 137.1,
          points: 6
        },
        {
          position: 5,
          team: 'Mumbai Indians',
          matches: 8,
          won: 2,
          lost: 6,
          nrr: -1.75,
          runsFor: 1003,
          oversFor: 155.2,
          runsAgainst: 1134,
          oversAgainst: 138.1,
          points: 4
        }
      ]);
    }
  };

  const handleCalculate = async () => {
    // Validation
    if (!formData.yourTeam || !formData.oppositionTeam || !formData.overs || 
        !formData.desiredPosition || !formData.tossResult || !formData.runs) {
      alert('Please fill all fields!');
      return;
    }

    try {
      setLoading(true);
      
      // Send request to backend
      const response = await fetch('http://localhost:5000/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Print the backend's formatted output to console
        if (data.data && data.data.output) {
          console.log(data.data.output);
        }
        
       
      } else {
        alert(`Error: ${data.message || 'Something went wrong'}`);
        console.error('Error:', data);
      }
    } catch (error) {
      console.error('Error calculating NRR:', error);
      alert(' Failed to connect to backend server.\n\nPlease make sure:\n1. Backend server is running (npm start in backend folder)\n2. Server is running on http://localhost:5000\n3. CORS is enabled');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🏏 Cricket NRR Calculator
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Form Section */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Match Details</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Your Team *
            </label>
            <select
              value={formData.yourTeam}
              onChange={(e) => setFormData({...formData, yourTeam: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            >
              <option value="">Select Your Team</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Opposition Team *
            </label>
            <select
              value={formData.oppositionTeam}
              onChange={(e) => setFormData({...formData, oppositionTeam: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            >
              <option value="">Select Opposition Team</option>
              {teams.filter(t => t !== formData.yourTeam).map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              How many overs match? *
            </label>
            <select
              value={formData.overs}
              onChange={(e) => setFormData({...formData, overs: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            >
              <option value="">Select Overs</option>
              <option value="20">20 Overs</option>
              <option value="50">50 Overs</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Desired Position (1-5) *
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.desiredPosition}
              onChange={(e) => setFormData({...formData, desiredPosition: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              placeholder="Enter position"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Toss Result *
            </label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tossResult"
                  value="Batting First"
                  checked={formData.tossResult === 'Batting First'}
                  onChange={(e) => setFormData({...formData, tossResult: e.target.value})}
                />
                Batting First
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tossResult"
                  value="Bowling First"
                  checked={formData.tossResult === 'Bowling First'}
                  onChange={(e) => setFormData({...formData, tossResult: e.target.value})}
                />
                Bowling First
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {formData.tossResult === 'Batting First' ? 'Runs Scored *' : 'Runs to Chase *'}
            </label>
            <input
              type="number"
              min="0"
              value={formData.runs}
              onChange={(e) => setFormData({...formData, runs: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              placeholder="Enter runs"
            />
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9CA3AF' : 'linear-gradient(to right, #4F46E5, #7C3AED)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Calculating...' : 'Calculate NRR'}
          </button>
        </div>

        {/* Points Table Section */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>IPL 2022 Points Table</h2>
          
          {pointsTable.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
              <p>Loading points table...</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(to right, #4F46E5, #7C3AED)', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Team</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>M</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>W</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>L</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>NRR</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>For</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Against</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {pointsTable.map((team, index) => (
                  <tr key={team.team} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <td style={{ padding: '10px' }}>{team.position}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{team.team}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{team.matches}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{team.won}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{team.lost}</td>
                    <td style={{ 
                      padding: '10px', 
                      textAlign: 'center', 
                      fontWeight: 'bold',
                      color: team.nrr >= 0 ? '#22c55e' : '#ef4444'
                    }}>
                      {team.nrr > 0 ? '+' : ''}{team.nrr.toFixed(3)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                      {team.runsFor}/{team.oversFor}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                      {team.runsAgainst}/{team.oversAgainst}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', color: '#4F46E5' }}>
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
        
        </div>
      </div>
    </div>
  );
}

export default App;