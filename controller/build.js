const express = require('express')
const buildb = require('../model/build')
const { param } = require('express-validator')
const { validArgs, validAuth } = require('./util')
// const minio = require('minio');

// const minioTargetsBucket = 'buildtar'

// let minioClient = new minio.Client({
//     port: Number(process.env.MINIO_PORT),
//     endPoint: process.env.MINIO_ENDPOINT,
//     accessKey: process.env.MINIO_ACCESSKEY,
//     secretKey: process.env.MINIO_SECRETKEY,
//     useSSL: false
// })

let buildRoute = express()

async function getBuildStatus(req, res) {
    const authUser = req.user;
    const { project, build, user } = await buildb.getProjectUser(req.params.build, authUser.id);
    if (!build)
        return res.status(404).end('build not found');
    res.json({ buildId: build.id, status: build.status });
}

buildRoute.get('/build/:build/status',
    param('build').isInt().toInt(),
    validArgs, validAuth, getBuildStatus
)

exports.build = buildRoute