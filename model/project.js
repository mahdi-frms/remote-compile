let { db } = require('./db')

exports.get = async (pid) => {
    const user = await db.query('select * from projects where id=($1);', [pid])
    if (!user.rowCount)
        return null
    else
        return user.rows[0]
}
