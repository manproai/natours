const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const { sendEmail } = require('../utils/email');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const { catchAsync } = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const verifyToken = (token) =>
  promisify(jwt.verify)(token, process.env.JWT_SECRET);

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // uses https for cookie
    httpOnly: true, // means the cookie cannot be accessed by any means by browser to prevent cross-side attack
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //remove password fromt he output, Dummy way
  user.password = undefined;
  user.passwordConfirm = undefined;
  user.passwordDateChangedAt = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

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

  sendToken(newUser, 200, res);
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

  //Create token and send res
  sendToken(user, 200, res);
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user with this email', 404));
  }

  //Generate random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: true });

  //Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit your new password and password confirm to :${resetURL}.\n
  If you did not forget your email please ignore this email`;

  try {
    //Send the email
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token and it is valid within 10 mins',
      message,
    });

    //Send the response to the user
    res.status(200).json({
      status: 'success',
      message: 'Token sent to the mail',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: true });
    console.log(err);

    return next(
      new AppError(
        'An error occured while sending the email. Please try it later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //hash the coming password
  const hashedPassword = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //Get the user based on token
  const user = await User.findOne({
    passwordResetToken: hashedPassword,
    passwordResetExpires: { $gt: Date.now() },
  });

  //check the user
  if (!user) return next(new AppError('Invalid or expired token', 403));

  //reset the password and tokens undefined
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //save the user
  await user.save();

  //Change the passwordDateChangedAt

  sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  if (!req.body.passwordCurrent) {
    return next(new AppError('Please provide password', 403));
  }

  //Get the user from collection
  const user = await User.findById(req.user.id).select('+password');

  //Check the coming password and saved password
  const isCorrectPassword = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );

  if (!isCorrectPassword) return next(new AppError('Incorrect password', 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  sendToken(user, 200, res);
});
