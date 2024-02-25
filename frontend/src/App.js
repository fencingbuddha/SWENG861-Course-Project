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


  const fetchFlights = async () => {
    try {
      const response = await axios.get('/api/flights', {
        params: {  
          departDate,
          returnDate,
          fromId,
          toId,
        },
      });
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
      alert('Failed to save flight.');
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
    <div>
      <h2>Flight Search</h2>
      <div>
        <label htmlFor="fromId">From: </label>
        <input id="fromId" type="text" value={fromId} onChange={handleFromIdChange} placeholder="Airport ID (e.g., CLE)" />
        <label htmlFor="toId">To: </label>
        <input id="toId" type="text" value={toId} onChange={handleToIdChange} placeholder="Airport ID (e.g., LAX)" />
        <label htmlFor="departDate">Departure Date: </label>
        <input id="departDate" type="date" value={departDate} onChange={handleDepartDateChange} />
        <label htmlFor="returnDate">Return Date: </label>
        <input id="returnDate" type="date" value={returnDate} onChange={handleReturnDateChange} />
        <button onClick={fetchFlights}>Search</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h3>Search Results:</h3>
        {flights.length > 0 ? (
        <ul>
          {flights.map((flightGroup, index) => (
            flightGroup.flights.map((flight, flightIndex) => (
              <li key={`${index}-${flightIndex}`}>
                Flight from {flight.departure_airport.name} ({flight.departure_airport.id})
                at {flight.departure_airport.time} to
                {flight.arrival_airport.name} ({flight.arrival_airport.id})
                at {flight.arrival_airport.time} -
                {flight.airline} - Flight Number: {flight.flight_number}
                <button onClick={() => saveFlight(flight)}>Save</button>
              </li>
            ))
          ))}
        </ul>
        ) : (
          <p>No flights found</p>
        )}
      </div>
      <div>
      <h3>Saved Flights:</h3>
      <ul>
        {savedFlights.map((flight, index) => (
          <li key={index}>
            Flight Number: {flight.flight_number}, Departure: {flight.departure}, Arrival: {flight.arrival}
            <button onClick={() => deleteFlight(flight.flight_number)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  </div>
  );
};

export default FlightSearch;