require('dotenv').config();

const cookieParser = require('cookie-parser')
const express = require('express');
const { user } = require('./controller/user')
const { project } = require('./controller/project')

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION;

let app = express()
app.use(express.json())
app.use(cookieParser())
app.get('/api/version', (req, res) => {
    res.send({
        version: VERSION
    });
})

app.use('/api', user)
app.use('/api', project)

app.listen(PORT, () => {
    console.log(`http server listening on port ${PORT}...`);
});