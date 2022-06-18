const express = require('express')
const projdb = require('../model/project')
const srvdb = require('../model/server')
const buildb = require('../model/build')
const filedb = require('../model/file')
const { param } = require('express-validator')
const { validArgs, validAuth } = require('./util')
const pconf = require('./pconf');
const minio = require('minio');

const minioFilesBucket = 'projsrc'

let minioClient = new minio.Client({
    port: Number(process.env.MINIO_PORT),
    endPoint: process.env.MINIO_ENDPOINT,
    accessKey: process.env.MINIO_ACCESSKEY,
    secretKey: process.env.MINIO_SECRETKEY,
    useSSL: false
})

let projRoute = express()

function getFileKey(pid, fid) {
    return `${pid}-${fid}`
}

async function requestBuild(server, buildId) {
    // todo
}

async function getProject(req, res) {
    const { user } = req;
    const project = await projdb.get(req.params.project, user.id);
    if (!project)
        return res.status(404).end('project not found');
    delete project.id;
    res.json(project);
}

async function getProjects(req, res) {
    const { user } = req;
    let projects = await projdb.getAll(user.id);
    projects = projects.map((p) => {
        return {
            name: p.name,
            config: p.config,
        }
    });
    res.json(projects);
}

async function postProject(req, res) {
    const { user } = req;
    const name = req.params.project;
    const config = req.body;
    if (!pconf.validate(config))
        return res.status(400).end('project configuration out of format');
    const server = await srvdb.getMin();
    if (!server)
        return res.status(400).end('no build server available');
    if (!await projdb.create({ name, config, uid: user.id, sid: server.id }))
        return res.status(400).end('unavailable project name');
    await srvdb.updateProjects(server.id)
    res.end();
}

async function putProject(req, res) {
    const { user } = req;
    const name = req.params.project;
    const config = req.body;
    if (!pconf.validate(config))
        return res.status(400).end('project configuration out of format');
    const rsl = await projdb.updateConfig({ name, config, uid: user.id })
    if (!rsl)
        return res.status(404).end('project not found');
    res.end();
}

async function putProjectFile(req, res) {
    let { project, file } = req.params
    const { user } = req;
    project = await projdb.get(project, user.id);
    if (!project)
        return res.status(404).end('project not found');
    const files = pconf.getTreeFiles(project.config.tree)
    if (!files.includes(file))
        return res.status(400).end('file not in project tree');
    const fileKey = getFileKey(project.id, file);
    await filedb.create(project.id, file, fileKey)
    await minioClient.putObject(minioFilesBucket, fileKey, req.body)
    res.end()
}

async function getProjectFile(req, res) {
    let { project, file } = req.params
    const { user } = req;
    project = await projdb.get(project, user.id);
    if (!project)
        return res.status(404).end('project not found');
    try {
        const content = await minioClient.getObject(minioFilesBucket, getFileKey(project.id, file))
        content.pipe(res)
    }
    catch (err) {
        res.status(404).end('file not found')
    }
}

async function postProjectBuild(req, res) {
    const projname = req.params.project
    const { user } = req;
    const { project, server } = await projdb.getServer(projname, user.id);
    if (!project)
        return res.status(404).end('project not found');
    if (!await projdb.initBuild(project))
        return res.status(400).end('project is being built');
    buildId = await buildb.create({ pid: project.id })
    await requestBuild(server, buildId)
    res.json({ buildId })
}

projRoute.get('/project/:project',
    validAuth, getProject
)

projRoute.get('/projects/',
    validAuth, getProjects
)

projRoute.post('/project/:project',
    validAuth, postProject
)

projRoute.put('/project/:project',
    validAuth, putProject
)

projRoute.put('/project/:project/file/:file',
    express.text(),
    param('file').isInt().toInt(),
    validArgs, validAuth, putProjectFile
)

projRoute.get('/project/:project/file/:file',
    param('file').isInt().toInt(),
    validArgs, validAuth, getProjectFile
)

projRoute.post('/project/:project/build',
    validAuth, postProjectBuild
)

exports.project = projRoute