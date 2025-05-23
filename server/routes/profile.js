const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/authenticate');
 // assuming you use JWT

// Storage setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });

// // POST /api/profile/upload
// router.post('/upload', upload.single('profilePic'), (req, res) => {
//   const filePath = `/uploads/${req.file.filename}`;
//   res.status(200).json({ imageUrl: filePath });
// });

// profile.js (add this to your existing router)

// PATCH /api/profile/update
router.patch('/image', authenticate, upload.single('profilePic'), async (req, res) => {
  try {
    const imagePath = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imagePath },
      { new: true }
    );

    res.status(200).json({
      message: 'Profile image updated',
      profileImage: updatedUser.profileImage
    });
  } catch (err) {
    res.status(500).json({ error: 'Image update failed' });
  }
});


module.exports = router;
