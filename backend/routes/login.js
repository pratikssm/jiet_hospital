const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password, role } = req.body;

  console.log('Received data:', req.body);

  try {
    let user;

    if (role === 'doctor') {
      console.log('Searching doctor:', email);

      const allDoctors = await Doctor.find({});
      console.log('Total Doctors:', allDoctors.length);

      user = await Doctor.findOne({
        email: email.trim().toLowerCase()
      });

      console.log('Doctor Found:', user);
    }
    else if (role === 'admin') {
      user = await Admin.findOne({
        email: email.trim().toLowerCase(),
        role
      });

      console.log('Admin Found:', user);
    }
    else {
      user = await User.findOne({
        email: email.trim().toLowerCase(),
        role
      });

      console.log('Patient Found:', user);
    }

    if (!user) {
      return res.status(400).json({
        error: 'Invalid email or role'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log('Password Match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({
        error: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      {
        expiresIn: '24h'
      }
    );

    res.status(200).json({
      token,
      role: user.role,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login Error:', error);

    res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router;