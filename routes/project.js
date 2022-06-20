import express from 'express'
import {
    postProject, putProject, getProject,
    getProjects,
    postProjectNotify,
    postProjectBuild
} from '../controller/project.js'
import { validArgs, validAuth, validSecret, validParamString, validParamId } from './valid.js'

let route = express()

route.get('/project/:project',
    validParamString('project'),
    validArgs, validAuth, getProject
)

route.get('/projects/',
    validAuth, getProjects
)

route.post('/project/:project',
    validParamString('project'),
    validArgs, validAuth, postProject
)

route.put('/project/:project',
    validParamString('project'),
    validArgs, validAuth, putProject
)

route.post('/project/:project/build',
    validParamString('project'),
    validArgs, validAuth, postProjectBuild
)

route.post('/project/:pid/notify',
    validParamId('pid'),
    validArgs, validSecret, postProjectNotify
)

export { route as project }