import * as userdb from '../model/user.js'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'
import express from 'express'
import { body } from 'express-validator'
import { validArgs, validAuth } from './util.js'

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
    if (extraCredit < 0)
        return res.status(400).end('credit must be a positive integer')
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

let userRoute = express()
userRoute.use(express.json())

userRoute.post('/login',
    body('username').isString().isLength({ max: 50 }),
    body('password').isString().isLength({ max: 50 }),
    validArgs, login
);

userRoute.post('/chname',
    body('fname').if(body('fname').exists()).isString().isLength({ max: 50 }),
    body('lname').if(body('lname').exists()).isString().isLength({ max: 50 }),
    validArgs, validAuth, chname
);

userRoute.post('/register',
    body('username').isString().isLength({ max: 50 }),
    body('password').isString().isLength({ max: 50 }),
    body('fname').isString().isLength({ max: 50 }),
    body('lname').isString().isLength({ max: 50 }),
    validArgs, register
);

userRoute.post('/chpass',
    body('newpass').isString().isLength({ max: 50 }),
    body('oldpass').isString().isLength({ max: 50 }),
    validArgs, validAuth, chpass
);

userRoute.get('/profile',
    validAuth, profile
);

userRoute.post('/charge',
    body('credit').isInt(),
    validArgs, validAuth, charge
);

export { userRoute as user };