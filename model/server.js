let { db } = require('./db');

exports.getMin = async () => {
    const project = await db.query('select * from servers order by projects asc limit 1;');
    if (!project.rowCount)
        return null;
    else
        return project.rows[0];
}

exports.get = async (id) => {
    const project = await db.query('select * from servers where id=$1;', [id]);
    if (!project.rowCount)
        return null;
    else
        return project.rows[0];
}

exports.updateProjects = async (id) => {
    await db.execute('update servers set projects=projects+1 where id=$1;', [id]);
}