const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');
const adminCheck = require('../middleware/admin-check');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

router.post('/forgot-password', usersController.forgotPassword);
router.post('/reset-password/:token', usersController.resetPassword);

router.get('/:uid', usersController.getUserById);

router.use(checkAuth);
router.patch('/profile', usersController.updateProfile);
router.post('/update-password', usersController.updatePassword);

router.delete('/:uid', checkAuth, adminCheck, usersController.deleteUser);

module.exports = router;
