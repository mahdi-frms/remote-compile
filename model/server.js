let { db } = require('./db');

exports.getMin = async () => {
    const project = await db.query('select * from servers order by projects asc limit 1');
    if (!project.rowCount)
        return null;
    else
        return project.rows[0];
}