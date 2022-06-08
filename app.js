require('dotenv').config();

const express = require('express');
const { login } = require('./controller/user')

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION;

let app = express()
app.use(express.json())
app.get('/api/version', (req, res) => {
    res.send({
        version: VERSION
    });
})

app.post('/api/login', login)

app.listen(PORT, () => {
    console.log(`http server listening on port ${PORT}...`);
});