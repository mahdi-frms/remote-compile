const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

exports.validArgs = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    next()
}