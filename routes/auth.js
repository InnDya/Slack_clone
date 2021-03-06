const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');

const User = require('../models/users');

// Login 
router.get('/login', (request, response) => {
    response.render('login');
});

router.post('/login', (request, response, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(request, response, next);
});

// Register
router.get('/register', (request, response) => {
    response.render('register');
});

router.post('/register', (request, response) => {
    const { name, email, password } = request.body;

    let errors = [];

    console.log(`Name: ${name}, Email: ${email}, Password: $ {password}`);

    if (!name || !email || !password) {
        errors.push({ msg: "Please fill out all fields" });
    }

    if (password.length < 6) {
        errors.push({ msg: "Use at least 6 characters for your password" });
    }

    if (errors.length > 0) {
        response.render('register', {
            errors, name, email, password
        });
    } else {
        const newUser = new User({
            name, email, password
        });

        bcrypt.hash(password, 10, function (error, hash) {
            // Store hash in your password DB.
            newUser.password = hash;

            newUser
                .save()
                .then(value => {
                    request.flash('success_msg', 'You have been registered!');
                    response.redirect('/login');
                })
                .catch(error => console.log(error));
        });
    }
});

// Logout
router.get('/logout', (request, response) => {
    request.logout();
    request.flash('success_msg', 'You have logged out');
    response.redirect('/login');

});

module.exports = router;