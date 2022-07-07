const { catchAsync } = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

//Methods ----------------------------------------------------------------
const filterObj = (body, ...fields) => {
  const filteredObj = {};

  Object.keys(body).forEach((el) => {
    if (fields.includes(el)) {
      filteredObj[el] = body[el];
    }
  });

  return filteredObj;
};

//Controllers ----------------------------------------------------------------
exports.getAllUsers = catchAsync(async (req, res, next) => {
  //Executing the Query -------------------------------------------------------------

  const allUsers = await User.find();

  //Sending the response -------------------------------------------------------------
  res.status(200).json({
    status: 'success',
    data: {
      allUsers,
    },
  });
});
exports.getUser = (req, res, next) => {};

exports.updateUser = (req, res, next) => {};

exports.deleteUser = (req, res, next) => {};

exports.createUser = (req, res, next) => {};

exports.updateMe = catchAsync(async (req, res, next) => {
  //check whether there is a password in the body, it is only for other documents
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This is not to change your password. Please use /updatePassword instead',
        400
      )
    );
  }
  //filter the unwanted field names
  const filteredObj = filterObj(req.body, 'email', 'name');

  //Update the user
  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  //update the user
  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //Change the user status
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
  });
});
