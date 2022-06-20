import { } from 'dotenv/config'

import cookieParser from 'cookie-parser'
import express from 'express'
import { user } from './routes/user.js'
import { project } from './routes/project.js'
import { build } from './routes/build.js'
import { file } from './routes/file.js'

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
app.use('/api', file)

app.listen(PORT, () => {
    console.log(`http server listening on port ${PORT}...`);
});