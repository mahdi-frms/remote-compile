import express from 'express'
import {
    postProject, putProject, getProject,
    getProjects,
    getProjectFile, putProjectFile,
    postProjectNotify,
    postProjectBuild
} from '../controller/project.js'
import { validArgs, validAuth, validSecret } from '../controller/util.js'
import { param } from 'express-validator'

function validateProjectParam() {
    return param('project').isLength({ max: 50 })
}

function validateFileParam() {
    return param('file').isInt().toInt()
}

let route = express()

route.get('/project/:project',
    validateProjectParam, validArgs,
    validAuth, getProject
)

route.get('/projects/',
    validAuth, getProjects
)

route.post('/project/:project',
    validateProjectParam, validArgs,
    validAuth, postProject
)

route.put('/project/:project',
    validateProjectParam, validArgs,
    validAuth, putProject
)

route.put('/project/:project/file/:file',
    express.text(),
    validateProjectParam, validateFileParam, validArgs,
    validAuth, putProjectFile
)

route.get('/project/:project/file/:file',
    validateProjectParam, validateFileParam, validArgs,
    validAuth, getProjectFile
)

route.post('/project/:project/build',
    validateProjectParam, validArgs,
    validAuth, postProjectBuild
)

route.post('/project/:pid/notify',
    param('pid').isInt().toInt(), validArgs,
    validSecret, postProjectNotify
)

export { route as project }