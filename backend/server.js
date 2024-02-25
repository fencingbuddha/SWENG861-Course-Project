// Import required libraries and modules
const express = require('express'); // Express framework for Node.js
const cors = require('cors'); // CORS middleware for Express
const sqlite3 = require('sqlite3').verbose(); // SQLite database library
const { getJson } = require("serpapi"); // SerpApi library for making API requests
require('dotenv').config(); // dotenv for loading environment variables

// Create an Express application
const app = express();

// Define the port for the server to listen on, using the PORT environment variable or defaulting to 3001
const port = process.env.PORT || 3001;

// Load environment variables
const serpApiKey = process.env.SERPAPI_KEY;

// Use JSON middleware for parsing request bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Setup SQLite database connection
const dbPath = 'C:/Users/beebe/SWENG861/Flight Database/flightdatabase.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the flightdatabase database.');
  }
});

// Endpoint for retrieving flights information
app.get('/api/flights', async (req, res, next) => {
  const { departDate, returnDate, fromId, toId } = req.query;
  const errors = [];

  // Validate required parameters
  if (!departDate) errors.push("Departure date is missing.");
  if (!fromId) errors.push("Please enter an airport in the 'From:' field.");
  if (!toId) errors.push("Please enter an airport in the 'To:' field.");

  // Return validation errors if any
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    // Construct parameters for SerpApi request
    const apiRequestParams = {
      api_key: serpApiKey,
      engine: "google_flights",
      hl: "en",
      gl: "us",
      departure_id: fromId.toUpperCase(),
      arrival_id: toId.toUpperCase(),
      outbound_date: departDate,
      currency: "USD",
      type: returnDate ? "1" : "2" // 1 for round-trip, 2 for one-way
    };

    // Add return_date parameter if provided (for round-trip flights)
    if (returnDate) apiRequestParams.return_date = returnDate;

    // Make request to SerpApi to get flight information
    const json = await new Promise((resolve, reject) => {
      getJson(apiRequestParams, resolve, reject);
    });

    // Log API response and send it as JSON response
    console.log('API response:', json);
    res.json(json);
  } catch (error) {
    // Log and handle errors
    console.error('Error fetching flights:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint for saving flight information to the database
app.post('/api/save-flight', (req, res) => {
  const { flightNumber, departure, arrival } = req.body;
  const queryText = 'INSERT INTO flights(flight_number, departure, arrival) VALUES(?, ?, ?)';
  db.run(queryText, [flightNumber, departure, arrival], function(err) {
    if (err) {
      console.error('Error saving flight:', err.message);
      if (err.code === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: flights.flight_number') {
        res.status(409).json({ error: 'Flight already exists in the database.' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(200).json({ message: 'Flight saved successfully', id: this.lastID });
    }
  });
});

// Endpoint for retrieving saved flights from the database
app.get('/api/saved-flights', (req, res) => {
  db.all("SELECT * FROM flights", [], (err, rows) => {
    if (err) {
      console.error('Error fetching saved flights:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(rows);
  });
});

// Endpoint for deleting a flight from the database
app.delete('/api/delete-flight/:flightNumber', (req, res) => {
  const { flightNumber } = req.params;
  db.run("DELETE FROM flights WHERE flight_number = ?", [flightNumber], function(err) {
    if (err) {
      console.error('Error deleting flight:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ message: 'Flight deleted successfully', deletedRows: this.changes });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: errorMessage });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log('Server is running on http://localhost:3001');
});
