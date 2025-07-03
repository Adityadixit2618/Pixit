const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const { listeners } = require('process');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    image: existingUser.image,
    isAdmin: existingUser.isAdmin,
    token: token
  });
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError('No user found with that email.', 404));
    }
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    // Debug: log environment variables
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Exists' : 'Missing');
    // Set up nodemailer for SendGrid
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER, // should be 'apikey'
        pass: process.env.EMAIL_PASS  // your SendGrid API key
      }
    });

    // Use frontend URL for reset link
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    await transporter.sendMail({
      to: user.email,
      from: 'vitvellore34@gmail.com',
      subject: 'Password Reset',
      html: `<p>You requested a password reset</p><p>Click this <a href="${resetUrl}">link</a> to set a new password. This link will expire in 1 hour.</p>`
    });

    res.status(200).json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error('ForgotPassword error:', err);
    return res.status(500).json({ message: err.message || 'Sending reset email failed, try again later.' });
  }
};

const resetPassword = async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const token = req.params.token;
  if (password !== confirmPassword) {
    return next(new HttpError('Passwords do not match.', 422));
  }
  let user;
  try {
    user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
      return next(new HttpError('Token is invalid or has expired.', 400));
    }
    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.status(200).json({ message: 'Password has been reset.' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    return res.status(500).json({ message: err.message || 'Resetting password failed, try again later.' });
  }
};

const updateProfile = async (req, res, next) => {
  const userId = req.userData.userId;
  const { name, email, phone } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    await user.save();
    console.log('Updated user:', user);
    res.status(200).json({ message: 'Profile updated.', user: user.toObject({ getters: true }) });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    res.status(500).json({ message: 'Updating profile failed.' });
  }
};

const updatePassword = async (req, res, next) => {
  const userId = req.userData.userId;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    return res.status(422).json({ message: 'New passwords do not match.' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(403).json({ message: 'Current password is incorrect.' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.status(200).json({ message: 'Password updated.' });
  } catch (err) {
    console.error('UpdatePassword error:', err);
    res.status(500).json({ message: 'Updating password failed.' });
  }
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const user = await User.findById(userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    res.status(500).json({ message: 'Fetching user failed.' });
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Deleting user failed.' });
  }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.updateProfile = updateProfile;
exports.updatePassword = updatePassword;
exports.getUserById = getUserById;
exports.deleteUser = deleteUser;
