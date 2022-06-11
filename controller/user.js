const User = require('../model/user')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const express = require('express')
const { body } = require('express-validator')
const { validArgs, validAuth } = require('./util')

const passwordSalt = '343-354tjigwlf]];.s];r,elw78';

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
    let user = await User.get(username);
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
    let user = await User.get(username);
    if (user)
        return res.status(400).end('username unavailable');
    password = passwordHash(password);
    await User.create({ username, password, fname, lname });
    const token = await createToken(username);
    res.cookie('jwt-token', token).end();
}

async function profile(req, res) {
    let { username } = req;
    let user = await User.get(username);
    if (!user)
        return res.status(400).end('invalid username');
    delete user.password
    delete user.id
    res.json(user)
}

// WARNING! this below should NOT be done in any real production environment.
// charging the account includes sending requests to a payment system
// and redirecting the user to a gateway and setting an API endpoint
// to which the gateway redirects the user.

async function charge(req, res) {
    let { username } = req;
    let user = await User.get(username);
    if (!user)
        return res.status(400).end('invalid username');
    const extraCredit = req.body.credit;
    if (extraCredit < 0)
        return res.status(400).end('credit must be a positive integer')
    user.credit += extraCredit;
    await User.update(user)
    res.json({ credit: user.credit })
}

async function chpass(req, res) {
    let { username } = req;
    let user = await User.get(username);
    if (!user)
        return res.status(400).end('invalid username');
    const password = passwordHash(req.body.oldpass)
    if (user.password != password)
        return res.end('invalid password')
    user.password = passwordHash(req.body.newpass)
    await User.update(user)
    res.end()
}

let user = express()

user.post('/login',
    body('username').isString(),
    body('password').isString(),
    validArgs, login
);

user.post('/register',
    body('username').isString(),
    body('password').isString(),
    body('fname').isString(),
    body('lname').isString(),
    validArgs, register
);

user.post('/chpass',
    body('newpass').isString(),
    body('oldpass').isString(),
    validArgs, validAuth, chpass
);

user.get('/profile',
    validAuth, profile
);

user.post('/charge',
    body('credit').isInt(),
    validArgs, validAuth, charge
);

exports.user = user