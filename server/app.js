const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

router.get('/api', (req, res) => {
    console.log(req.query);
});

module.exports = router