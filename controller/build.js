import * as buildb from '../model/build.js'
import storage from './storage.js'

const minioTargetsBucket = 'buildtar'

async function getBuildStatus(req, res) {
    const authUser = req.user;
    const { build } = await buildb.getProjectUser(req.params.build, authUser.id);
    if (!build)
        return res.status(404).end('build not found');
    res.json(build.status || {});
}

async function getBuildLog(req, res) {
    const authUser = req.user;
    const { build } = await buildb.getProjectUser(req.params.build, authUser.id);
    if (!build)
        return res.status(404).end('build not found');
    if (build.status == null)
        return res.status(400).end('build not complete');
    try {
        const content = await storage.getObject(minioTargetsBucket, build.logkey);
        content.pipe(res);
    }
    catch (err) {
        res.status(500).end('failed to retrieve logfile');
    }
}

async function getBuildTarget(req, res) {
    const authUser = req.user;
    const { build } = await buildb.getProjectUser(req.params.build, authUser.id);
    if (!build)
        return res.status(404).end('build not found');
    if (build.status == null)
        return res.status(400).end('build not complete');
    const tarname = req.params.target;
    const target = await buildb.getTarget(build.id, tarname);
    if (!target)
        return res.status(404).end(`target '${tarname}' not generated`);
    const objkey = target.objkey;
    try {
        const content = await storage.getObject(minioTargetsBucket, objkey);
        content.pipe(res);
    }
    catch (err) {
        res.status(500).end('failed to retrieve target');
    }
}

export { getBuildLog, getBuildStatus, getBuildTarget }