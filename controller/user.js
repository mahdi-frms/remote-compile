const User = require('../model/user')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const express = require('express')

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
    password = crypto.createHash('md5').update(password);
    if (user.password != password) return res.status(400).end('invalid username or password');
    const token = createToken(username);
    res.cookie('jwt-token', token).end();
}

exports.login = express().use(login);