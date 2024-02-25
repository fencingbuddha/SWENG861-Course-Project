const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Import sqlite3 library
const app = express();
const port = process.env.PORT || 3001;
const { getJson } = require("serpapi");
require('dotenv').config();
const serpApiKey = process.env.SERPAPI_KEY;

app.use(express.json());
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

app.get('/api/flights', async (req, res, next) => {
  const { departDate, returnDate, fromId, toId } = req.query;
  const errors = [];

  if (!departDate) errors.push("Departure date is missing.");
  if (!fromId) errors.push("Please enter an airport in the 'From:' field.");
  if (!toId) errors.push("Please enter an airport in the 'To:' field.");

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const apiRequestParams = {
      api_key: serpApiKey,
      engine: "google_flights",
      hl: "en",
      gl: "us",
      departure_id: fromId.toUpperCase(),
      arrival_id: toId.toUpperCase(),
      outbound_date: departDate,
      currency: "USD",
      type: returnDate? "1" : "2"
    };

    // Only add return_date if it's provided (implying a round-trip flight)
    if (returnDate) apiRequestParams.return_date = returnDate;

    const json = await new Promise((resolve, reject) => {
      getJson(apiRequestParams, resolve, reject);
    });

    console.log('API response:', json);
    res.json(json);
  } catch (error) {
    console.error('Error fetching flights:', error);
    // Send a 500 Internal Server Error response if an unexpected error occurs
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post('/api/save-flight', (req, res) => {
  const { flightNumber, departure, arrival } = req.body;
  const queryText = 'INSERT INTO flights(flight_number, departure, arrival) VALUES(?, ?, ?)';
  db.run(queryText, [flightNumber, departure, arrival], function(err) {
    if (err) {
      console.error('Error saving flight:', err.message);
      // Check if the error is a UNIQUE constraint violation
      if (err.code === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: flights.flight_number') {
        // Respond with a 409 Conflict status code to indicate a duplicate entry
        res.status(409).json({ error: 'Flight already exists in the database.' });
      } else {
        // For other types of errors, continue to respond with a 500 Internal Server Error
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(200).json({ message: 'Flight saved successfully', id: this.lastID });
    }
  });
});


// GET endpoint for retrieving saved flights
app.get('/api/saved-flights', (req, res) => {
  db.all("SELECT * FROM flights", [], (err, rows) => {
    if (err) {
      console.error('Error fetching saved flights:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(rows);
  });
});

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


app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: errorMessage });
});

app.listen(port, () => {
  console.log('Server is running on http://localhost:3001');
});
