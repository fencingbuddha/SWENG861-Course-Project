// src/components/FlightStatus.js



import React, { useState } from 'react';

import axios from 'axios';



const FlightStatus = () => {

  const [departureAirport, setDepartureAirport] = useState('');

  const [arrivalAirport, setArrivalAirport] = useState('');

  const [date, setDate] = useState('');

  const [flightStatus, setFlightStatus] = useState(null);

  const [error, setError] = useState(null);



  const handleInputChange = (event) => {

    const { name, value } = event.target;

    if (name === 'departureAirport') {

      setDepartureAirport(value);

    } else if (name === 'arrivalAirport') {

      setArrivalAirport(value);

    } else if (name === 'date') {

      setDate(value);

    }

  };



  const handleFetchFlightStatus = async () => {

    try {
  
      const response = await axios.get(`http://localhost:3001/api/flight-status`, {
  
        params: {
  
          departureAirport,
  
          arrivalAirport,
  
          date,
  
        },
  
      });
  
      setFlightStatus(response.data);
  
      setError(null);
  
    } catch (error) {
  
      console.error('Error fetching flight status:', error.message);
  
      setError('Error fetching flight status. Check console for details.');
  
      setFlightStatus(null);
  
    }
  
  };
  
  



  return (

    <div>

      <h2>Flight Status</h2>

      <div>

        <label>Departure Airport: </label>

        <input type="text" name="departureAirport" value={departureAirport} onChange={handleInputChange} />

      </div>

      <div>

        <label>Arrival Airport: </label>

        <input type="text" name="arrivalAirport" value={arrivalAirport} onChange={handleInputChange} />

      </div>

      <div>

        <label>Date: </label>

        <input type="text" name="date" value={date} onChange={handleInputChange} />

      </div>

      <button onClick={handleFetchFlightStatus}>Fetch Status</button>

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



export default FlightStatus;

