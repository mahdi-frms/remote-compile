const User = require('../model/user')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const express = require('express')
const { body } = require('express-validator')
const { validArgs, validAuth } = require('./util')

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
    if (!user) return res.status(400).end('invalid username or password');
    password = crypto.createHash('md5').update(password).digest('hex');
    if (user.password != password) return res.status(400).end('invalid username or password');
    const token = await createToken(username);
    res.cookie('jwt-token', token).end();
}

async function register(req, res) {
    let { username, password, fname, lname } = req.body;
    let user = await User.get(username);
    if (user) return res.status(400).end('username unavailable');
    password = crypto.createHash('md5').update(password).digest('hex');
    await User.create({ username, password, fname, lname });
    const token = await createToken(username);
    res.cookie('jwt-token', token).end();
}

async function profile(req, res) {
    let { username } = req;
    let user = await User.get(username);
    if (!user) return res.status(400).end('invalid username');
    delete user.password
    delete user.id
    res.json(user)
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

user.get('/profile',
    validAuth, profile
);

exports.user = user