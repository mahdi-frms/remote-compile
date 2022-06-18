let { db } = require('./db');

const Status = {
    None: 0,
    Build: 1
}

exports.Status = Status;

exports.get = async (name, uid) => {
    const project = await db.query('select * from projects where name=$1 and uid=$2;', [name, uid]);
    if (!project.rowCount)
        return null;
    else
        return project.rows[0];
}

exports.getAll = async (uid) => {
    return await (await db.query('select * from projects where uid=$1;', [uid])).rows;
}

exports.create = async (project) => {
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

exports.updateConfig = async (project) => {
    const rsl = await db.query('update projects set config=$1 where name=$2 and uid=$3;', [
        project.config,
        project.name,
        project.uid
    ]);
    return Boolean(rsl.rowCount);
}

exports.initBuild = async (project) => {
    const rsl = await db.query('update projects set status=$1 where name=$2 and uid=$3 and status=$4;', [
        Status.Build,
        project.name,
        project.uid,
        Status.None
    ]);
    project.status = Status.Build;
    return Boolean(rsl.rowCount);
}