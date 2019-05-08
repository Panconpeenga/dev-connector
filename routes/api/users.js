const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrpyt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

//Bring in user model
const User = require('../../models/User');
// @route       POST api/users
// @description Register user
// @access      Public
router.post('/', [
  check('name', 'Name is required')
    .not()
    .isEmpty(),
  check('email', 'Please include a valid email')
    .isEmail(),
  check('password', 'Please enter a password with 6 or more characters')
    .isLength({min: 6})
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res
      .status(400)
      .json({errors: errors.array()});
    }
    const {name, email, password} = req.body;
    try {
      let user = await User.findOne({ email });

      //See if user exists

      if (user){
        return res
        .status(400)
        .json( { errors: [{msg: 'User already exists'}] });
      }

      const avatar = gravatar.url( email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      })

      //Get users gravatar

      user = new User({
        name,
        email,
        avatar,
        password
      })

      //Encrypt passwork (using bcrypt)
      const salt = await bcrpyt.genSalt(10);

      user.password = await bcrpyt.hash(password, salt);

      await user.save();
      //Return jsonwebtoken
      res.send('User registered');
    } catch(err){
      console.error(err.message);
      res.status(500).send('Server error');
    }


    res.send('User route');
  }
);

module.exports = router;
