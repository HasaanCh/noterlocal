const nodemailer = require("nodemailer");
const User = require('../models/auth.model');
const _ = require('lodash');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/dbErrorHandling');

  const transporter = nodemailer.createTransport({
    host: "smtp.ionos.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "admin@waydevelopers.com", // generated ethereal user
      pass: "QpR^4Cku%eGFGzqxhY3vVhjsJ3sR", // generated ethereal password
    },
  });
// }


exports.registerController = (req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    User.findOne({
      email
    }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          errors: 'Email is taken'
        });
      }
      else
      {
        const token = jwt.sign(
          {
            name,
            email,
            password
          },
          process.env.JWT_ACCOUNT_ACTIVATION,
          {
            expiresIn: '5m'
          }
        );
    
        const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Account activation link',
          html: `
                    <h1>Please use the following to activate your account</h1>
                    <p>${process.env.CLIENT_URL}/activate/${token}</p>
                    <hr />
                    <p>This email may containe sensetive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `
        };
    
        transporter.sendMail(emailData).then(sent => {
            return res.json({
              message: `Email has been sent to ${email}`,
              data:sent
            });
          })
          .catch(err => {
            return res.status(400).json({
              success: false,
              errors: errorHandler(err)
            });
          });
      }
    });

   
  }
};

exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        console.log('Activation error');
        return res.status(401).json({
          errors: 'Expired link. Signup again'
        });
      } else {
        const { name, email, password } = jwt.decode(token);

        console.log(email);
        const user = new User({
          name,
          email,
          password
        });

        user.save((err, user) => {
                  if (err) {
                    console.log('Save error', errorHandler(err));
                    return res.status(401).json({
                      errors: errorHandler(err)
                    });
                  } else {
                    return res.json({
                      success: true,
                      message: user,
                      message: 'Signup success'
                    });
                  }
                });
      }
    });
  } else {
    return res.json({
      message: 'error happening please try again'
    });
  }
};

exports.signinController = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    // check if user exist
    User.findOne({
      email
    }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          errors: 'User with that email does not exist. Please signup'
        });
      }
      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          errors: 'Email and password do not match'
        });
      }
      // generate a token and send to client
      const token = jwt.sign(
        {
          _id: user._id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d'
        }
      );
      const { _id, name, email, role } = user;

      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role
        }
      });
    });
  }
};



