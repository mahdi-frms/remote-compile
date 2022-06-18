const express = require('express')
const buildb = require('../model/build')
const { param } = require('express-validator')
const { validArgs, validAuth } = require('./util')
const minio = require('minio');

const minioTargetsBucket = 'buildtar'

let minioClient = new minio.Client({
    port: Number(process.env.MINIO_PORT),
    endPoint: process.env.MINIO_ENDPOINT,
    accessKey: process.env.MINIO_ACCESSKEY,
    secretKey: process.env.MINIO_SECRETKEY,
    useSSL: false
})

let buildRoute = express()

async function getBuildStatus(req, res) {
    const authUser = req.user;
    const { project, build, user } = await buildb.getProjectUser(req.params.build, authUser.id);
    if (!build)
        return res.status(404).end('build not found');
    res.json({ buildId: build.id, status: build.status });
}

async function getBuildLog(req, res) {
    const authUser = req.user;
    const { project, build, user } = await buildb.getProjectUser(req.params.build, authUser.id);
    if (!build)
        return res.status(404).end('build not found');
    if (build.status == buildb.Status.Compiling)
        return res.status(400).end('build not complete');
    try {
        const content = await minioClient.getObject(minioTargetsBucket, build.logkey);
        content.pipe(res);
    }
    catch (err) {
        res.status(500).end('failed to retrieve logfile');
    }
}

buildRoute.get('/build/:build/status',
    param('build').isInt().toInt(),
    validArgs, validAuth, getBuildStatus
)

buildRoute.get('/build/:build/log',
    param('build').isInt().toInt(),
    validArgs, validAuth, getBuildLog
)

exports.build = buildRoute