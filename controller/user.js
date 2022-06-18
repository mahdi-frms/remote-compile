import * as userdb from '../model/user.js'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'

const passwordSalt = process.env.MD5_SALT;

function passwordHash(password) {
    return crypto.createHash('md5').update(`salt : ${passwordSalt} ${password}`).digest('hex');
}

function createToken(username) {
    return new Promise((resolve, reject) => {
        jwt.sign({ username }, process.env.JWT_SECRET, (err, token) => {
            if (err) reject(err)
            else resolve(token)
        })
    })
}

async function login(req, res) {
    let { username, password } = req.body;
    let user = await userdb.get(username);
    if (!user)
        return res.status(400).end('invalid username or password');
    password = passwordHash(password);
    if (user.password != password)
        return res.status(400).end('invalid username or password');
    const token = await createToken(username);
    res.cookie('jwt-token', token).end();
}

async function register(req, res) {
    let { username, password, fname, lname } = req.body;
    let user = await userdb.get(username);
    if (user)
        return res.status(400).end('username unavailable');
    password = passwordHash(password);
    await userdb.create({ username, password, fname, lname });
    const token = await createToken(username);
    res.cookie('jwt-token', token).end();
}

async function profile(req, res) {
    let { user } = req;
    delete user.password
    delete user.id
    res.json(user)
}

// WARNING! this below should NOT be done in any real production environment.
// charging the account includes sending requests to a payment system
// and redirecting the user to a gateway and setting an API endpoint
// to which the gateway redirects the user.

async function charge(req, res) {
    let { user } = req;
    const extraCredit = req.body.credit;
    const credit = user.credit + extraCredit;
    await userdb.updateCredit(user, credit)
    res.json({ credit: user.credit })
}

async function chpass(req, res) {
    let { user } = req;
    let password = passwordHash(req.body.oldpass)
    if (user.password != password)
        return res.end('invalid password')
    password = passwordHash(req.body.newpass)
    await userdb.updatePass(user, password)
    res.end()
}

async function chname(req, res) {
    let { user } = req;
    let fname = null
    let lname = null
    if (req.body.fname)
        fname = req.body.fname
    if (req.body.lname)
        lname = req.body.lname
    await userdb.updateName(user, fname, lname)
    res.end()
}

export { login, register, charge, chpass, chname, profile };