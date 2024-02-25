import React, { useState, useEffect } from 'react'; // Importing necessary modules from React
import axios from 'axios'; // Importing axios for making HTTP requests

const FlightSearch = () => { // Defining the FlightSearch component as a functional component
  // State variables using the useState hook
  const [departDate, setDepartDate] = useState(''); // Departure date
  const [returnDate, setReturnDate] = useState(''); // Return date
  const [fromId, setFromId] = useState(''); // Departure airport ID
  const [toId, setToId] = useState(''); // Arrival airport ID
  const [flights, setFlights] = useState([]); // List of flights obtained from search
  const [error, setError] = useState(''); // Error message to display
  const [savedFlights, setSavedFlights] = useState([]); // List of saved flights
  const [flightType, setFlightType] = useState('roundTrip'); // Type of flight: roundTrip or oneWay

  // Event handlers for input changes
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

  // Function to determine if the search button should be enabled
  const isSearchButtonEnabled = flightType === 'oneWay'
      ? fromId && toId && departDate
      : fromId && toId && departDate && returnDate;

  // Function to fetch flights from the server
  const fetchFlights = async () => {
    setError(''); // Resetting error state
    if (flightType === "roundTrip" && !returnDate) {
      setError('Please enter a return date for round-trip flights.');
      return;
    }

    try {
      // Making an HTTP GET request to fetch flights
      const params = {  
          departDate,
          fromId,
          toId,
      };
      if (flightType === "roundTrip") {
        params.returnDate = returnDate;
      }
      const response = await axios.get('/api/flights', { params });
      // Extracting flights data from the response and updating state
      const bestFlights = response.data.best_flights || [];
      const otherFlights = response.data.other_flights || [];
      const allFlights = [...bestFlights, ...otherFlights];
      setFlights(allFlights);
      setError('');
    } catch (error) {
      // Handling errors
      console.error('Error fetching flights:', error);
      setError('Failed to fetch flights. Please try again.');
      setFlights([]);
    }
  };  

  // Function to save a flight
  const saveFlight = async (flight) => {
    try {
      // Making an HTTP POST request to save flight
      await axios.post('/api/save-flight', {
        flightNumber: flight.flight_number,
        departure: flight.departure_airport.name,
        arrival: flight.arrival_airport.name
      });
      alert('Flight saved successfully!'); // Showing success message
      fetchSavedFlights(); // Refreshing the list of saved flights
    } catch (error) {
      console.error('Error saving flight:', error);
      // Handling errors related to saving flight
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.includes('UNIQUE')) {
        alert('Failed to save flight: Flight already exists in the database.');
      } else {
        alert('Failed to save flight. Please try again.');
      }
    }
  };  

  // Function to fetch saved flights
  const fetchSavedFlights = async () => {
    try {
      // Making an HTTP GET request to fetch saved flights
      const response = await axios.get('/api/saved-flights');
      // Updating state with the fetched saved flights
      setSavedFlights(response.data);
    } catch (error) {
      console.error('Error fetching saved flights:', error);
    }
  };

  // Effect hook to fetch saved flights on component mount
  useEffect(() => {
    fetchSavedFlights();
  }, []);

  // Effect hook to log flights whenever flights state changes
  useEffect(() => {
    console.log(flights);
  }, [flights]);

  // Function to delete a saved flight
  const deleteFlight = async (flightNumber) => {
    try {
      // Making an HTTP DELETE request to delete a flight
      await axios.delete(`/api/delete-flight/${flightNumber}`);
      // Refreshing the list of saved flights
      fetchSavedFlights();
    } catch (error) {
      console.error('Error deleting flight:', error);
    }
  };

  // JSX representing the component's UI
  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      {/* Search feature container */}
      <div style={{ marginBottom: '20px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1>Search</h1>
        <div>
          {/* Input fields for search parameters */}
          <label htmlFor="fromId">From: </label>
          <input id="fromId" type="text" value={fromId} onChange={handleFromIdChange} placeholder="Airport ID (e.g., CLE)" />
          <label htmlFor="toId">To: </label>
          <input id="toId" type="text" value={toId} onChange={handleToIdChange} placeholder="Airport ID (e.g., LAX)" />
          <label htmlFor="departDate">Departure Date: </label>
          <input id="departDate" type="date" value={departDate} onChange={handleDepartDateChange} />
          <label htmlFor="returnDate">Return Date: </label>
          <input id="returnDate" type="date" value={returnDate} onChange={handleReturnDateChange} />
          {/* Radio buttons for flight type */}
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
          {/* Search button */}
          <button onClick={fetchFlights} disabled={!isSearchButtonEnabled}>Search</button>
        </div>
        {/* Error message display */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {/* Results and Saved Flights side by side */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Search Results container */}
        <div style={{ flex: 1, marginRight: '10px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Search Results:</h3>
          {/* Displaying search results */}
          {flights.length > 0 ? (
            <ul>
              {flights.map((flightGroup) => (
                flightGroup.flights.map((flight, flightIndex) => (
                  <div key={`${flight.flight_number}-${flightIndex}`}>
                    {/* Displaying flight information */}
                    <p>Airline: <img src={flight.airline_logo} alt="Airline logo" /></p>
                    <p>Departure: {flight.departure_airport.name} ({flight.departure_airport.id}) at {flight.departure_time}</p>
                    <p>Arrival: {flight.arrival_airport.name} ({flight.arrival_airport.id}) at {flight.arrival_time}</p>
                    <p>Duration: {flight.total_duration} minutes</p>
                    <p>Price: {flightGroup.price}</p> {/* Assuming price is at the flightGroup level */}
                    <p>{flight.airline} - Flight Number: {flight.flight_number}</p>
                    <p>Type: {flightGroup.type}</p> {/* Assuming type is at the flightGroup level */}
                    {/* Button to save flight */}
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
          {/* Displaying saved flights */}
          <ul>
            {savedFlights.map((flight, index) => (
              <li key={index}>
                <p>Flight Number: {flight.flight_number}</p>
                <p>Departure: {flight.departure}</p> 
                <p>Arrival: {flight.arrival}</p>
                {/* Button to delete saved flight */}
                <button onClick={() => deleteFlight(flight.flight_number)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch; // Exporting the FlightSearch component
