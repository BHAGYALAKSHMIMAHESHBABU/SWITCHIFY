const express = require('express');
const multer = require('multer');
const MessageFriendly = require('../models/MessageFriendly');
const MessageProfessional = require('../models/MessageProfessional');
const User = require('../models/User'); // Assuming you have a User model
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Create a new message (with file upload)
router.post('/', upload.single('file'), async (req, res) => {
  const { to, text } = req.body;
  const from = req.user._id; // Assuming you have authentication middleware

  const newMessage = new Message({
    from,
    to,
    text,
    file: req.file?.filename,
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Message failed to save' });
  }
});

// Get previous messages between users
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  const currentUser = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { from: currentUser, to: userId },
        { from: userId, to: currentUser },
      ],
    })
      .sort({ createdAt: 1 })
      // .populate('from', 'username')  // Populate sender's username
      // .populate('to', 'username')
       .populate('from', 'username avatar')  // Populate sender's data
  .populate('to', 'username avatar');   // Optionally, populate receiver's username if needed

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
