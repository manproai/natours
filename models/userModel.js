const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name must be provided'],
  },
  email: {
    type: String,
    required: [true, 'Email must be provided'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'password must be provided'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'passwordConfirm must be provided'],
    validate: {
      //This only works on Save and Create docs
      validator: function (value) {
        return this.password === value;
      },
      message: 'Password should match',
    },
    select: false,
  },
  passwordDateChangedAt: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//mongo middlewares ------------------------------------------------------------------------------------------------

userSchema.pre('save', async function (next) {
  //only works when the password is modified TODO: isModified => checks
  if (!this.isModified('password')) return next();

  //TODO: Learn about password hashing and common practice and attacks
  //bcrypt is aysnc function so it returns promise so that we have to use await and async function to get the value
  this.password = await bcrypt.hash(this.password, 12);

  //delete confirm password as we don't need it
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordDateChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//Instance methods of mongo --------------------------------------------------------------------------------
//TODO: Instance methods allows us to have the functionality in all of the documents by getting doc from db
//Here we cannot access this.password because we set the password select to false so we have to give it in the arguments
userSchema.methods.correctPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordDateChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordDateChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return true;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = model('User', userSchema);

module.exports = User;
