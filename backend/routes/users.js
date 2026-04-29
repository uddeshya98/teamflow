const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

router.use(protect, restrictTo('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
