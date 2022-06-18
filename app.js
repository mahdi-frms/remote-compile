import { } from 'dotenv/config'

import cookieParser from 'cookie-parser'
import express from 'express'
import { user } from './controller/user.js'
import { project } from './controller/project.js'
import { build } from './controller/build.js'

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION;

let app = express()
app.use(cookieParser())
app.get('/api/version', (req, res) => {
    res.send({
        version: VERSION
    });
})

app.use('/api', user)
app.use('/api', project)
app.use('/api', build)

app.listen(PORT, () => {
    console.log(`http server listening on port ${PORT}...`);
});