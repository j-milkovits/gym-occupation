const fs = require('fs');

const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();

async function writeData(timestamp, occupation) {

    console.log('Attempting to write data...');

    let ts = parseInt(timestamp / 1000 / 60) * 1000 * 60; // round to minutes
    let occ = parseInt(occupation);

    // Open Database Connection
    let db = new sqlite3.Database('../db/occupation.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    // Insert fetched data into database

    db.run(`INSERT INTO data VALUES(${ts}, ${occ})`, [], (err) => {
        if (err) {
            return console.log(err.message);
        }
    });

    // Close Database Connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    console.log(`Successfully added ${ts} - ${occ}!`);
}

async function getOccupation() {
    try {
        console.log('Query going out...');

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto('https://www.fitnessfirst.de/clubs/darmstadt', { waitUntil: 'networkidle0' });
        let data = await page.evaluate(() => document.querySelector('.chartbar__percentage').innerHTML);

        // filter occupation numbers out of string array
        let occupation = [...data]
        .reduce((accumulator, currValue) => {
            if (!isNaN(parseInt(currValue))) {
                return accumulator + currValue;
            }
            return accumulator;
        }, '');

        await browser.close();
        console.log('Query successful!')

        return [Date.now(), occupation];
    } catch (err) {
        console.error(err);
    }
};

async function queryServer() {
    const [timestamp, occupation] = await getOccupation();

    writeData(timestamp, occupation);

    console.log();
};

console.log('Starting up...')

// run once
queryServer();

// query every 5 minutes
setInterval(queryServer, 60000 * 5);