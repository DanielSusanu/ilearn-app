const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');

// @route   GET api/cms/content/
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('CMS route'));

module.exports = router;
