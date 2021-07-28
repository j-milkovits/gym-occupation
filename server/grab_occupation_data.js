const puppeteer = require('puppeteer');
const fs = require('fs');

async function writeData(timestamp, occupation) {
    let rawdata = fs.readFileSync('data.json');
    let data = JSON.parse(rawdata);

    data.push({
        timestamp: parseInt(timestamp / 1000 / 60) * 1000 * 60, // round to minutes
        occupation: occupation,
    })

    fs.writeFileSync('data.json', JSON.stringify(data));
    console.log('Successfully added data!')
}

async function getOccupation() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto('https://www.fitnessfirst.de/clubs/darmstadt', { waitUntil: 'networkidle0' });
        let data = await page.evaluate(() => document.querySelector('.v-show-club-checkin--text').innerHTML);

        let percentage = '';

        [...data]
        .filter((elem) => {
            return !isNaN(parseInt(elem));
        })
        .forEach((elem) => {
            percentage += elem;
        })

        await browser.close();
        console.log('Query successful!')

        return [Date.now(), percentage];
    } catch (err) {
        console.error(err);
    }
};

async function queryServer() {

    console.log('Query going out...');
    const [timestamp, occupation] = await getOccupation();

    writeData(timestamp, occupation);
};

console.log('Starting up...')

setInterval(queryServer, 60000 * 5); // query every 5 minutes