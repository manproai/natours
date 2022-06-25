const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'password must be provided'],
    minlength: 8,
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
  },
});

userSchema.pre('save', async function (next) {
  //only works when the password is modified
  if (!this.isModified('password')) return next();
  //TODO: Learn about password hashing and common practice and attacks
  //bcrypt is aysnc function so it returns promise so that we have to use await and async function to get the value
  this.password = await bcrypt.hash(this.password, 12);
  //delete confirm password as we don't need it
  this.passwordConfirm = undefined;
  next();
});

const User = model('User', userSchema);

module.exports = User;
