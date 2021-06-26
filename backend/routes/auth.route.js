const express = require('express')
const router = express.Router()

// Load Controllers
const {
    registerController,
    activationController,
    signinController,
} = require('../controllers/auth.controller')



router.post('/register',
    registerController)

router.post('/login',
    signinController)

router.post('/activation', activationController)


module.exports = router