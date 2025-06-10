# Glass Orders System

A full-stack web application for managing client orders, payments, receipts, and exports — built with **Node.js**, **Express**, **SQLite3**, and **React** (powered by Vite).

## 📌 Features

* Create, view, and update client orders
* Track payments, total values, and balances
* Generate Excel reports (planned)
* Search orders by client name or order code
* Dark/light theme (planned)
* Designed for small businesses managing custom orders

## 🛠️ Technologies

* **Backend**: Node.js, Express, SQLite3
* **Frontend**: React, Vite
* **Styling**: CSS (Tailwind CSS planned)
* **Export**: Excel generation (planned)
* **Deployment**: Render (separate services for frontend and backend)

## 📂 Database Schema

| Column        | Type    | Description                          |
| ------------- | ------- | ------------------------------------ |
| id            | INTEGER | Auto-increment primary key           |
| order\_name   | TEXT    | Unique order name                    |
| client\_name  | TEXT    | Name of the client                   |
| pieces        | INTEGER | Number of pieces                     |
| order\_code   | TEXT    | Invoice (Nota Fiscal) code           |
| receipt\_code | TEXT    | Receipt code for down payment        |
| total\_value  | REAL    | Total value of the order             |
| entry         | REAL    | Amount paid in advance               |
| created\_at   | TEXT    | Creation date in `DD-MM-YYYY` format |

## 🙋 Author

Developed with care by [itzRaellK](https://github.com/itzRaellK) — building clean and practical web solutions for real business needs.
