let { db } = require('./db');

const Status = {
    Compiling: 0,
    Success: 1,
    Failure: 2
}

exports.Status = Status;

exports.create = async (build) => {
    const rsl = await db.query('insert into builds (pid) values ($1) returning id;', [build.pid]);
    return rsl.rows[0].id
}

exports.getProjectUser = async (id, uid) => {
    let rsl = await db.query(
        `select B.status as bstatus, P.status as pstatus, B.id as bid, * 
        from builds as B join projects as P on B.pid=P.id join users as U on P.uid=U.id
        where B.id=$1 and U.id=$2`,
        [id, uid]);
    if (rsl.rowCount == 0)
        return {
            project: null,
            build: null,
            user: null,
        };
    rsl = rsl.rows[0]

    const user = {
        id: rsl.uid,
        username: rsl.username,
        password: rsl.password,
        fname: rsl.fname,
        lname: rsl.lname,
        credit: rsl.credit
    };
    const project = {
        id: rsl.pid,
        name: rsl.name,
        status: rsl.pstatus,
        sid: rsl.sid,
        uid: rsl.uid,
        config: rsl.config
    };
    const build = {
        id: rsl.bid,
        pid: rsl.pid,
        status: rsl.bstatus,
    };

    return { user, project, build };
}

exports.getTarget = async (id, tarname) => {
    const rsl = await db.query('select objkey from targets where bid=$1 and name=$2;', [id, tarname]);
    if (rsl.rowCount == 0)
        return null;
    return rsl.rows[0];
}