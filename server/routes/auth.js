// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const router = express.Router();
// const { authenticate } = require('../middleware/authenticate');


// const JWT_SECRET = process.env.JWT_SECRET;

// // Signup
// router.post('/signup', async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     // Check if user already exists
//     const existingUser  = await User.findOne({ email });
//     if (existingUser ) {
//       return res.status(400).json({ error: 'User  already exists' });
//     }

//     // Create new user
//     const user = new User({ username, email, password });
//     await user.save();
    
//     res.status(201).json({ message: 'User  created successfully!' });
//   } catch (err) {
//     console.error(err);
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ error: 'Validation error: ' + err.message });
//     }
//     res.status(500).json({ error: 'Signup failed due to server error.' });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'User  not found' });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     // Create JWT token
//     const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token, username: user.username,
//       email: user.email});
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Login failed.' });
//   }
// });
// router.get('/finduser', authenticate, async (req, res) => {
//   const { query } = req.query;

//   try {
//     const user = await User.findOne({ 
//       $or: [
//         { email: query },
//         { username: query }
//       ]
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Failed to find user:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// module.exports = router;

const express = require('express');
// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');

const JWT_SECRET = process.env.JWT_SECRET;

// Signup
// Signup Route WITHOUT manual hashing
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Do NOT hash the password here
    const user = new User({ username, email, password }); 
    await user.save();

    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error: ' + err.message });
    }
    res.status(500).json({ error: 'Signup failed due to server error.' });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password); // Compare hashed password
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token with userId and other data
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    
    // Send token and user details in the response
    res.status(200).json({ 
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Find User (Authenticated route)
router.get('/finduser', authenticate, async (req, res) => {
  const { query } = req.query;

  try {
    // Search for user by email or username
    const user = await User.findOne({ 
      $or: [
        { email: query },
        { username: query }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Failed to find user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
