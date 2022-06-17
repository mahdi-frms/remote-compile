const express = require('express')
const projdb = require('../model/project')
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

function getFileName(pid, fid) {
    return `${pid}-${fid}`
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
    if (!await projdb.create({ name, config, uid: user.id }))
        return res.status(400).end('unavailable project name');
    res.end();
}

async function putProject(req, res) {
    const { user } = req;
    const name = req.params.project;
    const config = req.body;
    if (!pconf.validate(config))
        return res.status(400).end('project configuration out of format');
    const rsl = await projdb.update({ name, config, uid: user.id })
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
    await minioClient.putObject(minioFilesBucket, getFileName(project.id, file), req.body)
    res.end()
}

async function getProjectFile(req, res) {
    let { project, file } = req.params
    const { user } = req;
    project = await projdb.get(project, user.id);
    if (!project)
        return res.status(404).end('project not found');
    try {
        const content = await minioClient.getObject(minioFilesBucket, getFileName(project.id, file))
        content.pipe(res)
    }
    catch (err) {
        res.status(404).end('file not found')
    }
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

exports.project = projRoute