const express = require('express')
const projdb = require('../model/project')
const { param } = require('express-validator')
const { validArgs, validAuth } = require('./util')

let projRoute = express()

async function project(req, res) {
    const project = await projdb.get(req.param.project);
    if (!project)
        return res.status(400).end('project not found');
    const { user } = req;
    if (user.id != project.uid)
        return res.status(400).end('project not found');
    delete project.id;
    res.json(project);
}

projRoute.get('/project/:project',
    param('project').isNumeric(),
    validArgs, validAuth, project
)

exports.project = projRoute