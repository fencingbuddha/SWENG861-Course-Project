const express = require('express');

const axios = require('axios');

const app = express();

const port = process.env.PORT || 3001;



require('dotenv').config();



const rapidApiKey = process.env.X_RAPIDAPI_KEY;

const rapidApiHost = 'host_of_the_api'; // Replace with the host of the RapidAPI service

const apiBaseURL = 'base_url_of_the_api'; // Replace with the base URL of the API



app.use(express.json());



app.get('/api/flight-status', async (req, res) => {

  const { departureAirport, arrivalAirport, date } = req.query;



  if (!departureAirport || !arrivalAirport || !date) {

    return res.status(400).json({ error: 'Missing required parameters' });

  }



  try {

    const response = await axios.get(`${apiBaseURL}/endpoint/${departureAirport}/${arrivalAirport}/${date}`, {

      headers: {

        'X-RapidAPI-Key': rapidApiKey,

        'X-RapidAPI-Host': rapidApiHost

      }

    });



    res.json(response.data);

  } catch (error) {

    console.error('Error fetching flight status:', error.message);

    res.status(500).json({ error: 'Internal Server Error' });

  }

});



app.listen(port, () => {

  console.log(`Server is running on http://localhost:${port}`);

});

