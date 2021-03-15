const express = require('express');
const router = express.Router();

// Register page
router.get('/register', (request, response) => {
    response.render('register');
});

module.exports = router;