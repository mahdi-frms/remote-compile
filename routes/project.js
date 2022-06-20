import express from 'express'
import {
    postProject, putProject, getProject,
    getProjects,
    getProjectFile, putProjectFile, postProjectFile, getProjectFiles,
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

route.put('/project/:project/file/:file',
    express.text(),
    validParamString('project'),
    validParamId('file'),
    validArgs, validAuth, putProjectFile
)

route.post('/project/:project/file/:file',
    express.text(),
    validParamString('project'),
    validParamId('file'),
    validArgs, validAuth, postProjectFile
)

route.get('/project/:project/file/:file',
    validParamString('project'),
    validParamId('file'),
    validArgs, validAuth, getProjectFile
)

route.get('/project/:project/files',
    validParamString('project'),
    validArgs, validAuth, getProjectFiles
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