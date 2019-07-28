const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const randomBytes = require('randombytes');
const sendEmail = require('../../../email/nodemail');

// Get user model
const User = require('../../../models/User');
const Token = require('../../../models/Token');

// @route POST api/app/verify/token/:token_id
// @desc Confirm email
// @access Public
router.post('/token/:token_id', async (req, res) => {
  try {
    //console.log('DEGUB.verify, req.params:', req.params);
    // Try to find a token to verify
    const token = await Token.findOne({ token: req.params.token_id });
    if (!token)
      return res.status(400).json({
        msg: 'We were unable to find a valid token. Your token my have expired.'
      });
    // Try to find a user for this token
    const user = await User.findById(token._userId).select('-password');
    if (!user)
      return res
        .status(400)
        .json({ msg: 'We were unable to find a user for this token.' });
    if (user.isVerified)
      return res
        .status(400)
        .send({ msg: 'This user has already been verified.' });

    // Verify and save the user
    user.isVerified = true;

    // Save user to db
    await user.save();

    //res.json(user);
    res.status(200).send('Email has been verified successfuly! Please login');
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/app/verify/resend/
// @desc Resend email verification
// @access Public
router.post(
  '/resend/',
  [check('email', 'Please include a valid email').isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    try {
      // See if user exists
      const user = await User.findOne({ email }).select('-password');

      if (!user)
        return res
          .status(400)
          .send({ msg: 'We were unable to find a user with that email.' });
      if (user.isVerified)
        return res.status(400).send({
          msg: 'This account has already been verified. Please log in.'
        });

      // Create a verification token, save it, and send email
      var token = new Token({
        _userId: user._id,
        token: randomBytes(16).toString('hex')
      });

      // Save token
      await token.save();

      const emailContent = {
        to: email,
        subject: `${user.name.first} Test Subject`,
        text: `Thanks for the signup click here to verify your email ${
          token.token
        }`,
        html: `<b>Thanks for the signup click here to verify your email <br> ${
          token.token
        }</b>`
      };

      await sendEmail(emailContent);

      //res.json(user);
      res.status(200).send('Email has been send!');
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
