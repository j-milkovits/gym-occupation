const fs = require('fs');

const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();

async function writeData(timestamp, occupation) {

    let timestamp = parseInt(timestamp / 1000 / 60) * 1000 * 60; // round to minutes
    let occupation = parseInt(occupation);

    // Open Database Connection
    let db = new sqlite3.Database('../db/occupation.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Successfully connected to occupation.db');
    });

    // Insert fetched data into database

    db.run(`INSERT INTO data VALUES(${timestamp}, ${occupation})`, [], (err) => {
        if (err) {
            return console.log(err.message);
        }
    });

    // Close Database Connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Succesfully closed occupation.db');
    });

    console.log(`Successfully added ${timestamp} - ${occupation}!`);
}

async function getOccupation() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto('https://www.fitnessfirst.de/clubs/darmstadt', { waitUntil: 'networkidle0' });
        let data = await page.evaluate(() => document.querySelector('.v-show-club-checkin--text').innerHTML);

        let occupation = '';

        // filter occupation numbers out of string array
        [...data]
        .filter((elem) => {
            return !isNaN(parseInt(elem));
        })
        .forEach((elem) => {
            occupation += elem;
        })

        await browser.close();
        console.log('Query successful!')

        return [Date.now(), occupation];
    } catch (err) {
        console.error(err);
    }
};

async function queryServer() {

    console.log('Query going out...');
    const [timestamp, occupation] = await getOccupation();

    console.log();
    console.log('Starting to write data...');
    writeData(timestamp, occupation);

    console.log();
};

console.log('Starting up...')

// run once
queryServer();

// query every 5 minutes
setInterval(queryServer, 60000 * 5);