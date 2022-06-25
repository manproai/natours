const User = require('../models/userModel');
const { catchAsync } = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  //TODO: I have to check in other rojects how req.body is validated or checked before creating a doc in the db
  const newUser = await User.create(req.body);
  console.log(newUser); 

  res.status(200).json({
    status: 'success',
    data: {
      newUser,
    },
  });
});
