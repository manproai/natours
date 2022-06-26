const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const { catchAsync } = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const verifyToken = (token) =>
  promisify(jwt.verify)(token, process.env.JWT_SECRET);

exports.signup = catchAsync(async (req, res, next) => {
  //TODO: I have to check in other rojects how req.body is validated or checked before creating a doc in the db
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  };
  const newUser = await User.create(user);

  const token = signToken(newUser._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //Check email and password for availability
  if (!email || !password) {
    return next(new AppError('Provide both email and password', 400));
  }
  //Get the user
  const user = await User.findOne({ email }).select('+password');

  //Check the user exists
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 400));
  }

  //Create token
  const token = signToken(user._id);

  //Send the response
  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

exports.checkAuth = catchAsync(async (req, res, next) => {
  //Check token availability ------------------------------
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in', 401));
  }
  //Verify the token
  const verifiedToken = await verifyToken(token);

  //Check the user availability
  const user = await User.findById(verifiedToken.id);

  if (!user) {
    return next(
      new AppError('The user belong to this token does no longer exists', 401)
    );
  }

  //Check whether the password has changed after issuing JWT token
  const isPasswordChanged = user.changedPasswordAfter(verifiedToken.iat);

  if (isPasswordChanged) {
    return next(
      new AppError('The user has changed password. Please log in again', 401)
    );
  }

  //Grant the user access to the route
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('The user is not allowed to perform this action', 403)
      );
    }
    next();
  };
};
