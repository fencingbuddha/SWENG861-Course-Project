import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlightSearch = () => {
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');
  const [savedFlights, setSavedFlights] = useState([]);
  const [flightType, setFlightType] = useState('roundTrip');

  const handleDepartDateChange = (event) => {
    setDepartDate(event.target.value);
  };


  const handleReturnDateChange = (event) => {
    setReturnDate(event.target.value);
  };


  const handleFromIdChange = (event) => {
    setFromId(event.target.value.toUpperCase());
  };


  const handleToIdChange = (event) => {
    setToId(event.target.value.toUpperCase());
  };

  const handleFlightTypeChange = (event) => {
    setFlightType(event.target.value);
  };  

  const isSearchButtonEnabled = flightType === 'oneWay'
      ? fromId && toId && departDate
      : fromId && toId && departDate && returnDate;


  const fetchFlights = async () => {
    setError('');

    if (flightType === "roundTrip" && !returnDate) {
      setError('Please enter a return date for round-trip flights.');
    }

     try {
      const params = {  
          departDate,
          fromId,
          toId,
      };
      if (flightType === "roundTrip") {
        params.returnDate = returnDate;
      }
      const response = await axios.get('/api/flights', { params });
      const bestFlights = response.data.best_flights || [];
      const otherFlights = response.data.other_flights || [];
      const allFlights = [...bestFlights, ...otherFlights];
      setFlights(allFlights);
      setError('');
    } catch (error) {
      console.error('Error fetching flights:', error);
      setError('Failed to fetch flights. Please try again.');
      setFlights([]);
    }
  };  
  
  const saveFlight = async (flight) => {
    try {
      await axios.post('/api/save-flight', {
        flightNumber: flight.flight_number,
        departure: flight.departure_airport.name,
        arrival: flight.arrival_airport.name
      });
      alert('Flight saved successfully!');
      fetchSavedFlights();
    } catch (error) {
      console.error('Error saving flight:', error);
      // Check if the error is due to a UNIQUE constraint violation
      // This check might need to be adjusted based on the actual error structure and message
      if (error.response || error.response.data || error.response.data.error || error.response.data.error.includes('UNIQUE')) {
        alert('Failed to save flight: Flight already exists in the database.');
      } else {
        alert('Failed to save flight. Please try again.');
      }
    }
  };  

  const fetchSavedFlights = async () => {
    try {
      const response = await axios.get('/api/saved-flights');
      setSavedFlights(response.data);
    } catch (error) {
      console.error('Error fetching saved flights:', error);
    }
  };

  useEffect(() => {
    fetchSavedFlights();
  }, []);

  useEffect(() => {
    console.log(flights);
  }, [flights]);

  const deleteFlight = async (flightNumber) => {
    try {
      await axios.delete(`/api/delete-flight/${flightNumber}`);
      // Refresh the list of saved flights
      fetchSavedFlights();
    } catch (error) {
      console.error('Error deleting flight:', error);
    }
  };
  
  

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
    {/* Search feature container */}
    <div style={{ marginBottom: '20px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1>Search</h1>
            <div>
              <label htmlFor="fromId">From: </label>
              <input id="fromId" type="text" value={fromId} onChange={handleFromIdChange} placeholder="Airport ID (e.g., CLE)" />
              <label htmlFor="toId">To: </label>
              <input id="toId" type="text" value={toId} onChange={handleToIdChange} placeholder="Airport ID (e.g., LAX)" />
              <label htmlFor="departDate">Departure Date: </label>
              <input id="departDate" type="date" value={departDate} onChange={handleDepartDateChange} />
              <label htmlFor="returnDate">Return Date: </label>
              <input id="returnDate" type="date" value={returnDate} onChange={handleReturnDateChange} />
              <div>
                <label>
                  <input
                    type="radio"
                    name="flightType"
                    value="roundTrip"
                    checked={flightType === "roundTrip"}
                    onChange={handleFlightTypeChange}
                    /> Round-Trip
                </label>
                <label>
                <input
                    type="radio"
                    name="flightType"
                    value="oneWay"
                    checked={flightType === "oneWay"}
                    onChange={handleFlightTypeChange}
                    /> One-Way
                </label>
              </div>
              <button onClick={fetchFlights} disabled={!isSearchButtonEnabled}>Search</button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>

    {/* Results and Saved Flights side by side */}
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {/* Search Results container */}
      <div style={{ flex: 1, marginRight: '10px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Search Results:</h3>
        {flights.length > 0 ? (
          <ul>
            {flights.map((flightGroup) => (
              flightGroup.flights.map((flight, flightIndex) => (
                <div key={`${flight.flight_number}-${flightIndex}`}>
                  <p>Airline: <img src={flight.airline_logo} alt="Airline logo" /></p>
                  <p>Departure: {flight.departure_airport.name} ({flight.departure_airport.id}) at {flight.departure_time}</p>
                  <p>Arrival: {flight.arrival_airport.name} ({flight.arrival_airport.id}) at {flight.arrival_time}</p>
                  <p>Duration: {flight.total_duration} minutes</p>
                  <p>Price: {flightGroup.price}</p> {/* Assuming price is at the flightGroup level */}
                  <p>{flight.airline} - Flight Number: {flight.flight_number}</p>
                  <p>Type: {flightGroup.type}</p> {/* Assuming type is at the flightGroup level */}
                  <p><button onClick={() => saveFlight(flight)}>Save</button></p>
                </div>
              ))
            ))}
          </ul>
        ) : (
          <p>No flights found</p>
        )}
      </div>

      {/* Saved Flights container */}
      <div style={{ flex: 1, padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3>Saved Flights</h3>
        <ul>
          {savedFlights.map((flight, index) => (
            <li key={index}>
              <p>Flight Number: {flight.flight_number}</p>
              <p>Departure: {flight.departure}</p> 
              <p>Arrival: {flight.arrival}</p>
              <button onClick={() => deleteFlight(flight.flight_number)}>Delete</button>
            </li>
          ))}
          </ul>
      </div>
    </div>
  </div>
  );
};

export default FlightSearch;