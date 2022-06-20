import * as projdb from '../model/project.js'
import * as filedb from '../model/file.js'
import * as minio from 'minio'
import * as pconf from './pconf.js'

const minioFilesBucket = 'projsrc'

let minioClient = new minio.Client({
    port: Number(process.env.MINIO_PORT),
    endPoint: process.env.MINIO_ENDPOINT,
    accessKey: process.env.MINIO_ACCESSKEY,
    secretKey: process.env.MINIO_SECRETKEY,
    useSSL: false
})

function getFileKey(pid, fid) {
    return `${pid}-${fid}`
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
    const filekey = await filedb.update(project.id, file);
    if (!filekey)
        return res.status(400).end('file not created yet');
    await minioClient.putObject(minioFilesBucket, filekey, req.body)
    res.end()
}

async function postProjectFile(req, res) {
    let { project, file } = req.params
    const { user } = req;
    project = await projdb.get(project, user.id);
    if (!project)
        return res.status(404).end('project not found');
    const files = pconf.getTreeFiles(project.config.tree)
    if (!files.includes(file))
        return res.status(400).end('file not in project tree');
    const fileKey = getFileKey(project.id, file);
    const rsl = await filedb.create(project.id, file, fileKey)
    if (!rsl)
        return res.status(400).end('file already exists')
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

async function getProjectFiles(req, res) {
    let { project } = req.params
    const { user } = req;
    project = await projdb.get(project, user.id);
    if (!project)
        return res.status(404).end('project not found');

    res.json(await filedb.getAll(project.id))
}

export {
    getProjectFile, putProjectFile, postProjectFile, getProjectFiles,
}