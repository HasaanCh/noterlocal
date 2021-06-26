const express = require('express')
const router = express.Router()

// Load Controllers
const {
    registerController,
    activationController,
    signinController,
} = require('../controllers/auth.controller')


const {
    validSign,
    validLogin,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../helpers/valid')

router.post('/register',
    validSign,
    registerController)

router.post('/login',
    validLogin, signinController)

router.post('/activation', activationController)


module.exports = router