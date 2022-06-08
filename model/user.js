let { db } = require('../db')

exports.get = async (username) => {
    const user = await db.query('select * from users where username=($1)', [username])
    if (!user.rowCount)
        return null
    else
        return user.rows[0]
}

exports.create = async (user) => {
    await db.execute('insert into users (fname,lname,username,password,credit) values ($1,$2,$3,$4,$5)', [
        user.fname,
        user.lname,
        user.username,
        user.password,
        0
    ]);
}