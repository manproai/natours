const express = require('express');
const {
  deleteUser,
  createUser,
  updateUser,
  getUser,
  getAllUsers,
} = require('../controllers/userController.js');

const router = express.Router();

//Routes --------------------------------------------------------------------------------
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//export ------------------------------------------------------------------------------------
module.exports = router;
