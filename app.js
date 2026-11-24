const express = require('express');
const app = express();

app.get('/ping', (_, res) => {
    res.send('Pong!\n');
});

app.get('/health', (_, res) => {
    res.send('OK');
});

app.get('/slow', async (_, res) => {
    await (_ => new Promise(r => setTimeout(r, 2000)))() // this sleeps for 2s ok
    res.send('OK');
});

app.get('/error', (_, res) => {
    if (Math.random() >= 0.3) {
        res.send('OK');
    } else {
        res.status(500).send('KO');
    }
});

module.exports = app;