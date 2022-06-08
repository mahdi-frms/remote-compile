const User = require('../model/user')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const express = require('express')
const { needArgs } = require('./util')

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
    const token = createToken(username);
    res.cookie('jwt-token', token).end();
}

async function register(req, res) {
    let { username, password, fname, lname } = req.body;
    let user = await User.get(username);
    if (user) return res.status(400).end('username unavailable');
    password = crypto.createHash('md5').update(password).digest('hex');
    User.create({ username, password, fname, lname });
    const token = createToken(username);
    res.cookie('jwt-token', token).end();
}

exports.user = express()
    .post('/login', needArgs(['username', 'password']), login)
    .post('/register', needArgs(['username', 'password', 'fname', 'lname']), register);