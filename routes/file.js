import express from 'express'
import {
    getProjectFile, putProjectFile, postProjectFile, getProjectFiles, projectFile
} from '../controller/file.js'
import { validArgs, validAuth, validParamString, validParamId } from './valid.js'

let route = express()

route.put('/project/:project/file/:file',
    express.text(),
    validParamString('project'),
    validParamId('file'),
    validArgs, validAuth,
    projectFile, putProjectFile
)

route.post('/project/:project/file/:file',
    express.text(),
    validParamString('project'),
    validParamId('file'),
    validArgs, validAuth,
    projectFile, postProjectFile
)

route.get('/project/:project/file/:file',
    validParamString('project'),
    validParamId('file'),
    validArgs, validAuth,
    projectFile, getProjectFile
)

route.get('/project/:project/files',
    validParamString('project'),
    validArgs, validAuth,
    projectFile, getProjectFiles
)

export { route as file }