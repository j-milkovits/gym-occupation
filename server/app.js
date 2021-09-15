const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

router.get('/api', (req, res) => {
    let {startDate, endDate} = req.query;

    if (!startDate || !endDate) res.json({});
    
    // returns amount of hours to add to get to GMT + 0
    // handles german summer and winter times
    let hourOffset = new Date(Date.now()).getTimezoneOffset() / (-60);

    startDate = startDate - 1000 * 60 * 60 * hourOffset;

    // add one day to endDate to include the whole day in the query
    endDate = `${parseInt(endDate) + 1000 * 60 * 60 * 24}`;

    let timestamps = [];
    let occupations = [];

    // ':memory:' opens a RAM database
    let db = new sqlite3.Database(path.join(__dirname, '../db/occupation.db'), sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    db.all('SELECT * from data where timestamp between ? and ?', [startDate, endDate], (err, rows) => {
        rows.forEach((row) => {
            timestamps.push(row.timestamp);
            occupations.push(row.occupation);
        })

        let result = {
            timestamps: [...timestamps],
            occupations: [...occupations]
        }

        res.json(result);
    });

    // Close DB afterwards
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });
});

module.exports = router