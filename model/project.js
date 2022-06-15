let { db } = require('./db');

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
        await db.execute('insert into projects (uid,name,config) values ($1,$2,$3);', [
            project.uid,
            project.name,
            project.config
        ]);
        return true;
    }
    catch (err) {
        return false;
    }
}

exports.update = async (project) => {
    try {
        await db.execute('update projects set config=$1 where name=$2 and uid=$3;', [
            project.config,
            project.name,
            project.uid
        ]);
        return true;
    }
    catch (err) {
        return false;
    }
}