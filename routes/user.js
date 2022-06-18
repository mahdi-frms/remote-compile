import express from 'express'
import { charge, chpass, chname, login, register, profile } from '../controller/user.js'
import { validArgs, validAuth, validBodyString, validBodyStringOptional, validBodyPositiveInteger } from './valid.js'

let route = express()
route.use(express.json())

route.post('/login',
    validBodyString('username'),
    validBodyString('password'),
    validArgs, login
);

route.post('/chname',
    validBodyStringOptional('username'),
    validBodyStringOptional('password'),
    validArgs, validAuth, chname
);

route.post('/register',
    validBodyString('username'),
    validBodyString('password'),
    validBodyString('fname'),
    validBodyString('lname'),
    validArgs, register
);

route.post('/chpass',
    validBodyString('newpass'),
    validBodyString('oldpass'),
    validArgs, validAuth, chpass
);

route.get('/profile',
    validAuth, profile
);

route.post('/charge',
    validBodyPositiveInteger('credit'),
    validArgs, validAuth, charge
);

export { route as user }