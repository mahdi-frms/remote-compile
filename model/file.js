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

export { create }