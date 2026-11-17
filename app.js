const express = require('express');
const app = express();

app.get('/ping', (_, res) => {
    res.send('Pong!\n');
});

app.get('/health', (_, res) => {
    res.send('OK');
});

module.exports = app;