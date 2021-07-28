const sqlite3 = require('sqlite3').verbose();

// ':memory:' opens a RAM database
let db = new sqlite3.Database('../db/occupation.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Successfully connected to SQLite DB');
});

db.run('DELETE FROM data');

// Close DB afterwards
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Succesfully closed Database');
});