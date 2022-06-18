import express from 'express'
import { body } from 'express-validator'
import { charge, chpass, chname, login, register, profile } from '../controller/user.js'
import { validArgs, validAuth } from '../controller/util.js'

let route = express()
route.use(express.json())

function validateString(str) {
    return body(str).isString().isLength({ max: 50 })
}

function validateStringOptional(str) {
    return body(str).if(body(str).exists()).isString().isLength({ max: 50 })
}

route.post('/login',
    validateString('username'),
    validateString('password'),
    validArgs, login
);

route.post('/chname',
    validateStringOptional('username'),
    validateStringOptional('password'),
    validArgs, validAuth, chname
);

route.post('/register',
    validateString('username'),
    validateString('password'),
    validateString('fname'),
    validateString('lname'),
    validArgs, register
);

route.post('/chpass',
    validateString('newpass'),
    validateString('oldpass'),
    validArgs, validAuth, chpass
);

route.get('/profile',
    validAuth, profile
);

route.post('/charge',
    body('credit').isInt().toInt(),
    validArgs, validAuth, charge
);

export { route as user }