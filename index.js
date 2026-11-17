const express = require('express');
const app = express()
const port = 3000

app.get('/ping', (_, res) => {
    res.send('Pong!\n')
})

app.get('/health', (_, res) => {
    res.send('OK')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})