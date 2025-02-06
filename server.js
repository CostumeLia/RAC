// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('mailinglist.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the mailinglist database.');
});

// Create the table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        band INTEGER DEFAULT 0,
        choir INTEGER DEFAULT 0,
        summerMusical INTEGER DEFAULT 0
    )
`);

// API endpoint to handle form submissions
app.post('/api/signup', (req, res) => {
    const { name, email, interests } = req.body;

    // Server-side validation (important!)
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (!interests || interests.length === 0) {
        return res.status(400).json({ error: 'At least one interest must be selected.' });
    }

    // Prepare the SQL statement
    const sql = `
        INSERT INTO subscribers (name, email, band, choir, summerMusical)
        VALUES (?, ?, ?, ?, ?)
    `;

    // Set interest values (1 if selected, 0 if not)
    const band = interests.includes('band') ? 1 : 0;
    const choir = interests.includes('choir') ? 1 : 0;
    const summerMusical = interests.includes('summerMusical') ? 1 : 0;

    // Execute the SQL statement
    db.run(sql, [name, email, band, choir, summerMusical], function(err) {
        if (err) {
            console.error(err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email address already registered.' });
            }
            return res.status(500).json({ error: 'Failed to insert data.' });
        }

        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.json({ message: 'Signup successful!' });
    });
});

// API endpoint to get emails by interest
app.get('/api/emails/:interest', (req, res) => {
    const interest = req.params.interest;
    let column;

    switch (interest) {
        case 'band':
            column = 'band';
            break;
        case 'choir':
            column = 'choir';
            break;
        case 'summerMusical':
            column = 'summerMusical';
            break;
        default:
            return res.status(400).json({ error: 'Invalid interest.' });
    }

    const sql = `SELECT email FROM subscribers WHERE ${column} = 1`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to retrieve emails.' });
        }

        const emails = rows.map(row => row.email);
        res.json({ emails: emails });
    });
});

// Basic email validation function (server-side)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});