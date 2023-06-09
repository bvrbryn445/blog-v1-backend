const express = require('express');
const { authenticateUser } = require('../utils/middleware');
const {
	categoryCreate,
	categories,
	categoryFetch,
	categoryUpdate,
	categoryDelete,
	validateCategory,
	categoryImageFetch,
} = require('../controllers/category');
const Author = require('../models/author');
const upload = require('../utils/upload');

const router = express.Router();

// Ge tall of the categories
router.get('/', categories);

// Fetch a specific category by ID
router.get('/:id', categoryFetch);

// Fetch category image
router.get('/image/:id', categoryImageFetch);

// Create a new category
router.post('/',
	authenticateUser(Author),
	upload.single('categoryImage'),
	validateCategory,
	categoryCreate
);

// Update an existing category
router.put('/:id', authenticateUser(Author), categoryUpdate);

// Deletle an existing category
router.delete('/:id', authenticateUser(Author), categoryDelete);

module.exports = router;
