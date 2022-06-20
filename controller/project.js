import * as userdb from '../model/user.js'
import * as projdb from '../model/project.js'
import * as buildb from '../model/build.js'
import * as filedb from '../model/file.js'
import * as srvdb from '../model/server.js'
import * as pconf from './pconf.js'
import { got } from 'got';

const COST_PER_BUILD = (() => {
    let cost = Number(process.env.COST_PER_BUILD)
    if (!cost || cost % 1 !== 0 || cost <= 0) {
        console.error(`invalid COST_PER_BUILD (${process.env.COST_PER_BUILD})`)
        process.exit(1)
    }
    return cost
}).call()

function checkFiles(ufiles, nfiles) {
    let unavailables = []
    for (const nf of nfiles) {
        if (ufiles.findIndex((uf) => uf.fid == nf) == -1)
            unavailables.push(nf)
    }
    return unavailables.length == 0
}

async function requestBuild(server, buildId) {
    const URL = `${server.endPoint}:${server.port}/build/${buildId}`
    const res = await got.post(URL);
    if (res.statusCode != 200)
        return false;
    return true;
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

async function postProjectBuild(req, res) {
    const projname = req.params.project;
    const { user } = req;
    const { project, server } = await projdb.getServer(projname, user.id);
    if (!project)
        return res.status(404).end('project not found');
    const uploadedFiles = await filedb.getAll(project.id);
    const neededFiles = pconf.getTreeFiles(project.config.tree);
    if (!checkFiles(uploadedFiles, neededFiles))
        return res.status(400).end(`all files need to be uploaded before build`);
    if (user.credit < COST_PER_BUILD)
        return res.status(400).end(`not enough credit (${user.credit}) for build`);
    if (!await projdb.initBuild(project))
        return res.status(400).end('project is being built');
    const buildId = await buildb.create({ pid: project.id });
    await userdb.updateCredit(user, user.credit - COST_PER_BUILD);
    try {
        await requestBuild(server, buildId);
    }
    catch (err) {
        return res.status(500).end('operation failed')
    }
    res.json({ buildId });
}

async function postProjectNotify(req, res) {
    const project = await projdb.getById(req.params.pid)
    if (!project)
        return res.status(404).end('project not found');
    await projdb.endBuild(project)
    res.end()
}

export {
    getProject, postProject, putProject,
    getProjects,
    postProjectBuild,
    postProjectNotify,
}