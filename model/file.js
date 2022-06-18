let { db } = require('./db');

exports.create = async (pid, fid, key) => {
    try {
        await db.execute('insert into files (pid,fid,objkey) values ($1,$2,$3);', [pid, fid, key]);
    }
    catch (_) { }
}