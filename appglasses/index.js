// index.js

// Load ambient variables from .env
require('dotenv').config();

const ExcelJS = require('exceljs');
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

// Route to save a order in database
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

    res.json({
        order_name,
        message: '- Order saved successfully'
    });
});

// Route to consult orders in database using order_name
app.get('/orders/search', (req, res) => {
    const {order_name} = req.query;
    const sql = 'SELECT * FROM orders WHERE order_name = ?';

    if (!order_name) {
        return res.status(400).json({ error: 'order_name é obrigatório' });
    }

    db.all(sql, [order_name], (err, rows) => {
        if(err) {
            console.error('Error! Consult order failed:', err.message);
            return res.status(500).json({error: err.message});
        }
        res.json(rows);
    });
});

// Route to update orders in database using order_name
app.put('/orders', (req, res) => {
    const {order_name} = req.query;
    if(!order_name) {
        return res.status(400).json({ error: 'order_name is needed!'});
    }

    const {
        client_name,
        pieces,
        nf_code,
        receipt_code,
        total_value,
        entry
    } = req.body;

    // Recalculates remaining_amount
    const remaining_amount = parseFloat((entry - total_value).toFixed(2));

    const sql = `UPDATE orders
    SET client_name = ?, pieces = ?, nf_code = ?, receipt_code = ?, total_value = ?, entry = ?, remaining_amount = ?
    WHERE order_name = ?`;

    db.run(sql, [client_name, pieces, nf_code, receipt_code, total_value, entry, remaining_amount, order_name], 
        function(err) {
            if(err) {
                console.error('Order update failed!', err.message);
                return res.status(500).json({error: err.message});
            }
            if(this.changes === 0) {
                return res.status(404).json({error: 'Order not found!'})
            }
            res.json({
                order_name,
                message: '- Order updated successfully'
            });
        })
});

// Route to exports orders in a excel table
app.post('/orders/export', (req, res) => {
    // Waits a array to {order_name, pieces_from_delivery}
    const ordersToExport = req.body;

    // Make a validation on ordersToExport variable
    if (!Array.isArray(ordersToExport) || ordersToExport.length === 0) {
        return res.status(400).json({ error: 'You need to send an array of requests in the request body!' });
    }

    // Creates the workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pedidos');

    // Defines the columns in the sequence we need
    sheet.columns = [
        { header: 'Order Name', key: 'order_name', width: 12 },
        { header: 'Pieces', key: 'pieces', width: 5 },
        { header: 'PFD', key: 'pieces_from_delivery', width: 5 },
        { header: 'Total Value', key: 'total_value', width: 12 },
        { header: 'Entry', key: 'entry', width: 12 },
        { header: 'Rem. Amount', key: 'remaining_amount', width: 12 },
        { header: 'NF Code', key: 'nf_code', width: 10 },
        { header: 'Rec. Code', key: 'receipt_code', width: 10 },
        { header: 'Date', key: 'date', width: 10 },
        { header: 'Client Name', key: 'client_name', width: 20 },
    ];

    // Variable to control the flow
    let idx = 0;
    // Function to process and create rows in the excel file, as much as we need
    function processNext() {
        if (idx >= ordersToExport.length) {
            // All orders processed -> send Excel
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=pedidos.xlsx'
            );
            return workbook.xlsx.write(res).then(() => res.end());
        }

        const { order_name, pieces_from_delivery } = ordersToExport[idx++];
        const sql = 'SELECT * FROM orders WHERE order_name = ?';
        db.get(sql, [order_name], (err, order) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!order) {
                return res.status(404).json({ error: `Order not found: ${order_name}` });
            }

            // Add matching lines
            sheet.addRow({
                order_name: order.order_name,
                pieces: order.pieces,
                pieces_from_delivery,
                total_value: order.total_value,
                entry: order.entry,
                remaining_amount: order.remaining_amount,
                nf_code: order.nf_code,
                receipt_code: order.receipt_code,
                date: '',
                client_name: order.client_name,
            });

            processNext();
        });
    }

    processNext();
});


// Start the server
app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`)
});