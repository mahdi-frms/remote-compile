import db from './db.js'

const Status = {
    None: 0,
    Build: 1
}

async function get(name, uid) {
    const project = await db.query('select * from projects where name=$1 and uid=$2;', [name, uid]);
    if (!project.rowCount)
        return null;
    else
        return project.rows[0];
}

async function getById(pid) {
    const project = await db.query('select * from projects where id=$1;', [pid]);
    if (!project.rowCount)
        return null;
    else
        return project.rows[0];
}

async function getServer(name, uid) {
    let rsl = await db.query(
        'select * from projects as P join servers as S on P.sid = S.id where P.name=$1 and P.uid=$2;',
        [name, uid]
    );
    if (!rsl.rowCount)
        return { project: null, server: null };
    rsl = rsl.rows[0];
    const project = {
        id: rsl.id,
        name: rsl.name,
        uid: rsl.uid,
        sid: rsl.sid,
        config: rsl.config,
        status: rsl.id,
    };
    const server = {
        id: rsl.sid,
        endpoint: rsl.endpoint,
        port: rsl.port,
        projects: rsl.projects
    };
    return { project, server };
}

async function getAll(uid) {
    return await (await db.query('select * from projects where uid=$1;', [uid])).rows;
}

async function create(project) {
    try {
        await db.execute('insert into projects (uid,name,config,sid) values ($1,$2,$3,$4);', [
            project.uid,
            project.name,
            project.config,
            project.sid
        ]);
        return true;
    }
    catch (err) {
        return false;
    }
}

async function updateConfig(project) {
    const rsl = await db.query('update projects set config=$1, version=version+1 where name=$2 and uid=$3;', [
        project.config,
        project.name,
        project.uid
    ]);
    return Boolean(rsl.rowCount);
}

async function initBuild(project) {
    const rsl = await db.query('update projects set status=$1 where name=$2 and uid=$3 and status=$4;', [
        Status.Build,
        project.name,
        project.uid,
        Status.None
    ]);
    project.status = Status.Build;
    return Boolean(rsl.rowCount);
}

async function endBuild(project) {
    await db.execute('update projects set status=$1 where id=$2;', [
        Status.None,
        project.id
    ]);
    project.status = Status.None;
}

export { endBuild, initBuild, updateConfig, get, getAll, getServer, getById, create, Status }