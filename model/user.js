import * as db from './db.js'

async function get(username) {
    const user = await db.query('select * from users where username=($1);', [username]);
    if (!user.rowCount)
        return null;
    else
        return user.rows[0];
}

async function create(user) {
    await db.execute('insert into users (fname,lname,username,password,credit) values ($1,$2,$3,$4,$5);', [
        user.fname,
        user.lname,
        user.username,
        user.password,
        0
    ]);
}

async function updateName(user, fname, lname) {
    const { username } = user;
    if (fname && lname) {
        user.fname = fname;
        user.lname = lname;
        await db.execute(`update users set fname=$1, lname=$2 where username=$3`, [fname, lname, username]);
    }
    else if (lname) {
        user.lname = lname;
        await db.execute(`update users set lname=$1 where username=$2`, [lname, username]);
    }
    else {
        user.fname = fname;
        await db.execute(`update users set fname=$1 where username=$2`, [fname, username]);
    }
}

async function updatePass(user, password) {
    const { username } = user;
    user.password = password;
    await db.execute(`update users set password=$1 where username=$2`, [password, username]);
}

async function updateCredit(user, credit) {
    const { username } = user;
    user.credit = credit;
    await db.execute(`update users set credit=$1 where username=$2`, [credit, username]);
}

export { updateCredit, updatePass, updateName, get, create }