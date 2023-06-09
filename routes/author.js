const express = require('express');

const { authenticateUser } = require('../utils/middleware');

const {
	authorUpdate,
	authorFetch,
	authorRegister,
	authorLogin,
	validateAuthor,
	validateEmail
} = require('../controllers/author');
const Author = require('../models/author');

const router = express.Router();

router.get('/', authorFetch);

router.post('/register', validateAuthor, authorRegister);

router.post('/login', authorLogin);

router.put('/update', authenticateUser(Author), validateEmail, authorUpdate);

module.exports = router;

