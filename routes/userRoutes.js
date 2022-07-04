const express = require('express');

const {
  deleteUser,
  createUser,
  updateUser,
  getUser,
  getAllUsers,
  updateMe,
  deleteMe,
} = require(`../controllers/userController.js`);
const {
  signup,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  checkAuth,
} = require('../controllers/authController');

const router = express.Router();

//Routes --------------------------------------------------------------------------------
router.post('/signup', signup);
router.post('/login', login);

router.patch('/resetPassword/:to ken', resetPassword);
router.post('/forgotPassword', forgotPassword);
router.patch('/updatePassword', checkAuth, updatePassword);
router.patch('/updateMe', checkAuth, updateMe);
router.delete('/deleteMe', checkAuth, deleteMe);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//export ------------------------------------------------------------------------------------
module.exports = router;
