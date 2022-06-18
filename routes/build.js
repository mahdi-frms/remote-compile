import express from 'express'
import { getBuildLog, getBuildStatus, getBuildTarget } from '../controller/build.js'
import { validArgs, validAuth, validParamId } from './valid.js'

let route = express()

route.get('/build/:build/status',
    validParamId('build'), validArgs,
    validAuth, getBuildStatus
)

route.get('/build/:build/log',
    validParamId('build'), validArgs,
    validAuth, getBuildLog
)

route.get('/build/:build/target/:target',
    validParamId('build'), validArgs,
    validAuth, getBuildTarget
)

export { route as build }