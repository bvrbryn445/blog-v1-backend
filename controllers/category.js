const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Category = require('../models/category');

let gfs;

// Establish GridFsBucket connection
const conn = mongoose.connection;
conn.once('open', () => {
	gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
		bucketName: 'uploads'
	});
});

const validateCategory = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Name is a required input')
		.isString()
		.withMessage('The type of name must be string')
];

exports.validateCategory = [
	...validateCategory
];

exports.categoryImageFetch = async (req, res) => {
	const { id } = req.params;
	await gfs
		.find({ _id: id })
		.toArray((err, files) => {
			if (err) {
				return res.json(err);
			}

			if (!files || files.length === 0) {
				return res.status(404).json({ error: 'No file exists' });
			}

			// Make sure it is image
			if (files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png') {
				const mime = files[0].contentType;
				res.set('Content-Type', mime);

				// Read output to browser
				const readstream = gfs.openDownloadStream(id);
				readstream.pipe(res);
			} else {
				// Otherwise, indicate that it is not an image
				res.status(404).json({
					error: 'Not an image'
				});
			}
		});
};

exports.categoryCreate = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { name, description } = req.body;
	try {
		const isCategoryExists = await Category.findOne({ name });

		if (isCategoryExists && String(isCategoryExists._id) !== String(req.params.id)) {
			return res.status(400).json({ error: `Category ${req.body.name} exists already` });
		}

		const category = {
			name,
			description,
		};

		if (req.file) {
			category.imageId = req.file.id;
		}

		const newCategory = new Category(category);
		await newCategory.save();

		res.status(201).json(newCategory);
	} catch (err) {
		next(err);
	}
};

exports.categories = async (req, res, next) => {
	try {
		const categories = await Category.find({});
		res.json(categories);
	} catch (err) {
		next(err);
	}
};

exports.categoryFetch = async (req, res, next) => {
	const { id } = req.params;
	try {
		const category = await Category.findById(id);
		res.json(category);
	} catch (err) {
		next(err);
	}
};

exports.categoryUpdate = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { id } = req.params;

	try {
		const updatedCategory = {
			name: req.body.name,
			description: req.body.description,
			blogs: req.body.blogs
		};

		const categoryToUpdate = await Category.findByIdAndUpdate(
			id,
			{
				...updatedCategory,
			},
			{ new: true }
		);

		if (!categoryToUpdate) {
			return res.status(400).json({ error: `category "${req.body.name}" doesn/'t exist` });
		}

		res.json(categoryToUpdate);
	} catch (err) {
		next(err);
	}
};

exports.categoryDelete = async (req, res, next) => {
	const { id } = req.params;
	try {
		const category = await Category.findById(id);
		if (category.blogs.length > 0) {
			return res.status(400).json({
				message: 'You must remove all the associated blogs before deleting this category'
			});
		}

		await category.deleteOne({ _id: category._id });
		res.status(204).json(category);
	} catch (err) {
		next(err);
	}
};