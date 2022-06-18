import { db } from './db.js'

async function getMin() {
    const project = await db.query('select * from servers order by projects asc limit 1;');
    if (!project.rowCount)
        return null;
    else
        return project.rows[0];
}

async function get(id) {
    const project = await db.query('select * from servers where id=$1;', [id]);
    if (!project.rowCount)
        return null;
    else
        return project.rows[0];
}

async function updateProjects(id) {
    await db.execute('update servers set projects=projects+1 where id=$1;', [id]);
}

export { get, getMin, updateProjects }