let { db } = require('../db')
const crypto = require('crypto');
const { use } = require('express/lib/application');

exports.get = async (username) => {
    const user = await db.query('select * from users where username=($1)', [username])
    if (!user.rowCount)
        return null
    else
        return user.rows[0]
}