const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

exports.validArgs = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    next()
}

exports.validAuth = async (req, res, next) => {
    const token = req.cookies['jwt-token']
    if (!token) return res.status(401).end(`authentication required`)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(401).end(`authentication failed : invalid token`)
        const user = await userdb.get(decoded.username);
        if (!user)
            return res.status(400).end('invalid username');
        req.user = user
        next()
    })
}