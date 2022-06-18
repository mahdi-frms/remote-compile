let { db } = require('./db');

const Status = {
    Compiling: 0,
    Success: 1,
    Failure: 2
}

exports.Status = Status;

exports.create = async (build) => {
    const rsl = await db.query('insert into builds (pid) values ($1);', [build.pid]);
    return rsl.rows[0].id
}