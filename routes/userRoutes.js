const express = require('express');

const {
  deleteUser,
  createUser,
  updateUser,
  getUser,
  getAllUsers,
} = require(`../controllers/userController.js`);
const { signup } = require('../controllers/authController');

const router = express.Router();

//Routes --------------------------------------------------------------------------------
router.post('/signup', signup);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//export ------------------------------------------------------------------------------------
module.exports = router;
