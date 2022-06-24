import * as projdb from '../model/project.js'
import * as filedb from '../model/file.js'
import * as pconf from './pconf.js'
import storage from './storage.js'

const minioFilesBucket = 'projsrc'

function getFileKey(pid, fid) {
    return `${pid}-${fid}`
}

async function projectFile(req, res, next) {
    let { project } = req.params
    const { user } = req;
    project = await projdb.get(project, user.id);
    if (!project)
        return res.status(404).end('project not found');
    req.project = project
    next()
}

async function putProjectFile(req, res) {
    const { project } = req
    const { file } = req.params
    const files = pconf.getTreeFiles(project.config.tree)
    if (!files.includes(file))
        return res.status(400).end('file not in project tree');
    const filekey = await filedb.update(project.id, file);
    if (!filekey)
        return res.status(404).end('file not found');
    await storage.putObject(minioFilesBucket, filekey, req.body)
    res.end()
}

async function postProjectFile(req, res) {
    const { project } = req
    const { file } = req.params
    const files = pconf.getTreeFiles(project.config.tree)
    if (!files.includes(file))
        return res.status(400).end('file not in project tree');
    const fileKey = getFileKey(project.id, file);
    const rsl = await filedb.create(project.id, file, fileKey)
    if (!rsl)
        return res.status(400).end('file already exists')
    await storage.putObject(minioFilesBucket, fileKey, req.body)
    res.end()
}

async function getProjectFile(req, res) {
    const { project } = req
    const { file } = req.params
    try {
        const content = await storage.getObject(minioFilesBucket, getFileKey(project.id, file))
        content.pipe(res)
    }
    catch (err) {
        res.status(404).end('file not found')
    }
}

async function getProjectFiles(req, res) {
    const { project } = req
    res.json(await filedb.getAll(project.id))
}

export {
    getProjectFile, putProjectFile, postProjectFile, getProjectFiles, projectFile,
}