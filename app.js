require('dotenv').config();

const express = require('express');
const { user } = require('./controller/user')

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION;

let app = express()
app.use(express.json())
app.get('/api/version', (req, res) => {
    res.send({
        version: VERSION
    });
})

app.use('/api', user)

app.listen(PORT, () => {
    console.log(`http server listening on port ${PORT}...`);
});