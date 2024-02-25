import React, { useState } from 'react';
import axios from 'axios';


const Flightstatus = () => {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightStatus, setFlightStatus] = useState(null);
  const [error, setError] = useState(null);
  const handleInputChange = (event) => {
    setFlightNumber(event.target.value);
  };



  const handleFetchFlightStatus = async () => {

    try {

      const response = await axios.get(`http://localhost:3001/api/flight-status/${flightNumber}`);

      setFlightStatus(response.data);

      setError(null);

    } catch (error) {

      setError('Error fetching flight status');

      setFlightStatus(null);

    }

  };



  return (

    <div>

      <h2>Flight Status</h2>

      <div>

        <label>Enter Flight Number: </label>

        <input type="text" value={flightNumber} onChange={handleInputChange} />

        <button onClick={handleFetchFlightStatus}>Fetch Status</button>

      </div>

      {flightStatus && (

        <div>

          <h3>Status:</h3>

          <pre>{JSON.stringify(flightStatus, null, 2)}</pre>

        </div>

      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

    </div>

  );

};



export default Flightstatus;

