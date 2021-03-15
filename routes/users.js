const express = require('express');
const router = express.Router();

// Login 
router.get('/login', (request, response) => {
    response.render('login');
});

router.get('/register', (request, response) => {
    response.render('register');
});

module.exports = router;