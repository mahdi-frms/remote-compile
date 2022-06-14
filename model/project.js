let { db } = require('./db')

exports.get = async (name, uid) => {
    const user = await db.query('select * from projects where name=($1) and uid=($2);', [name, uid])
    if (!user.rowCount)
        return null
    else
        return user.rows[0]
}

exports.create = async (user) => {
    try {
        await db.execute('insert into projects (uid,name,config) values ($1,$2,$3);', [
            user.uid,
            user.name,
            user.config
        ]);
        return true
    }
    catch (err) {
        return false
    }
}
