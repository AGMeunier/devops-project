const express = require('express');
const app = express()
const port = 3000

app.get('/ping', (_, res) => {
    res.send('Pong!\n')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})