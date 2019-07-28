const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const randomBytes = require('randombytes');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const config = require('config');
const sendEmail = require('../../../email/nodemail');

// Get user model
const User = require('../../../models/User');
const Token = require('../../../models/Token');

// @route POST api/app/users
// @desc Register user
// @access Public
router.post(
  '/',
  [
    check('first', 'First name is required')
      .not()
      .isEmpty(),
    check('last', 'Last name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first, last, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({
        name: { first, last },
        email,
        avatar,
        password
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Create a verification token for this user
      var token = new Token({
        _userId: user._id,
        token: randomBytes(16).toString('hex')
      });

      // Save token
      await token.save();
      // Save user to db
      await user.save();

      const emailContent = {
        to: email,
        subject: `${first} Test Subject`,
        text: `Thanks for the signup click here to verify your email ${
          token.token
        }`,
        html: `<b>Thanks for the signup click here to verify your email <br> ${
          token.token
        }</b>`
      };

      await sendEmail(emailContent);

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
