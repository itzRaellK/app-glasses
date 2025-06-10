// index.js

// Load ambient variables from .env
require('dotenv').config();

const express = require('express');
const app = express();

// Server door (use variable PORT or 3000 to standard)
const port = process.env.PORT || 3000;

// Middleware to receive JSON in the body from requisitions
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de vridos está funcionando!')
});

// Start the server
app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`)
});