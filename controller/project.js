const express = require('express')
const projdb = require('../model/project')
const { param } = require('express-validator')
const { validArgs, validAuth } = require('./util')

let projRoute = express()

async function getProject(req, res) {
    const { user } = req;
    const project = await projdb.get(req.params.project, user.id);
    if (!project)
        return res.status(400).end('project not found');
    delete project.id;
    res.json(project);
}

async function postProject(req, res) {
    const { user } = req;
    const name = req.params.project;
    const config = req.body;
    if (!await projdb.create({ name, config, uid: user.id }))
        return res.status(400).end('unavailable project name');
    res.end();
}

projRoute.get('/project/:project',
    param('project').isString(),
    validArgs, validAuth, getProject
)

projRoute.post('/project/:project',
    param('project').isString(),
    validArgs, validAuth, postProject
)

exports.project = projRoute