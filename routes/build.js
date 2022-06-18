import express from 'express'
import { param } from 'express-validator'
import { getBuildLog, getBuildStatus, getBuildTarget } from '../controller/build.js'
import { validArgs, validAuth } from '../controller/util.js'

let route = express()

function validateBuild() {
    return param('build').isInt().toInt()
}

route.get('/build/:build/status',
    validateBuild(), validArgs,
    validAuth, getBuildStatus
)

route.get('/build/:build/log',
    validateBuild(), validArgs,
    validAuth, getBuildLog
)

route.get('/build/:build/target/:target',
    validateBuild(), validArgs,
    validAuth, getBuildTarget
)

export { route as build }