import db from './db.js'

async function create(pid, fid, key) {
    try {
        await db.execute('insert into files (pid,fid,objkey) values ($1,$2,$3);', [pid, fid, key]);
        return true
    }
    catch (_) {
        return false
    }
}

async function update(pid, fid) {
    const rsl = await db.query('update files set version = version + 1 where pid=$1 and fid=$2 returning objkey;', [pid, fid]);
    if (rsl.rowCount == 0)
        return null
    return rsl.rows[0].objkey
}

export { create, update }