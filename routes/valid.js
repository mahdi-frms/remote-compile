import jwt from 'jsonwebtoken'
import * as userdb from '../model/user.js'
import { validationResult, param, body } from 'express-validator'

async function validArgs(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    next()
}

async function validAuth(req, res, next) {
    const token = req.cookies['jwt-token']
    if (!token) return res.status(401).end(`authentication required`)
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err)
            return res.status(401).end(`authentication failed : invalid token`)
        const user = await userdb.get(decoded.username);
        if (!user)
            return res.status(400).end('invalid username');
        req.user = user
        next()
    })
}

async function validSecret(req, res, next) {
    const token = req.cookies['rcs-secret']
    if (!token)
        return res.status(400).end('this API call requires special privileges');
    if (token != process.env.RCS_SECRET)
        return res.status(401).end('authentication failed : invalid rcs secret');
    next()
}

function validParamString(str) {
    return param(str).isLength({ max: 50 });
}

function validBodyString(str) {
    return body(str).isString().isLength({ max: 50 })
}

function validBodyStringOptional(str) {
    return body(str).if(body(str).exists()).isString().isLength({ max: 50 })
}

function validParamId(id) {
    return param(id).isInt().toInt()
}

function validBodyPositiveInteger(num) {
    return param(num).isInt({ min: 1 }).toInt()
}

export {
    validArgs,
    validSecret,
    validAuth,
    validParamString,
    validParamId,
    validBodyString,
    validBodyStringOptional,
    validBodyPositiveInteger
}