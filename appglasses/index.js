// index.js

// Load ambient variables from .env
require('dotenv').config();

const express = require('express');
const app = express();

// Import db in the index.js file
const db = require('./db');

// Server door (use variable PORT or 3000 to standard)
const port = process.env.PORT || 3000;

// Middleware to receive JSON in the body from requisitions
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de vridos está funcionando!')
});

// Route to save a order in the database
app.post('/orders', (req, res) => {
    const {
        order_name,
        client_name,
        pieces,
        nf_code,
        receipt_code,
        total_value,
        entry,
    } = req.body;

    // Below we have date and remaining_amount calculations
    const remaining_amount = parseFloat((entry - total_value).toFixed(2));
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const date = `${day}/${month}/${year}`;

    const sql = `INSERT INTO orders
        (order_name, client_name, pieces, nf_code, receipt_code, total_value, entry, remaining_amount, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
        order_name,
        client_name,
        pieces,
        nf_code,
        receipt_code,
        parseFloat(total_value.toFixed(2)),
        parseFloat(entry.toFixed(2)),
        parseFloat(remaining_amount.toFixed(2)),
        date
    ], function(err) {
        if(err) {
            console.error('Error! Insert failed:', err.message);
            return res.status(400).json({error: err.message});
        }
        // this.lastID have the id of the created register
        res.status(201).json({
            id: this.lastID,
            remaining_amount,
            date
        });
    });
});

// Route to search orders in the database
app.get('/orders', (req, res) => {
    const sql = 'SELECT * FROM orders';

    db.all(sql, [], (err, rows) => {
        if(err) {
            console.error('Error! Search orders failed:', err.message);
            return res.status(500).json({error: err.message});
        }
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`)
});