const express = require('express');
const Contact = require('../models/Contact');
const User = require('../models/User');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate'); // Middleware to verify user authentication

// Add contact
router.post('/add', authenticate, async (req, res) => {
  const { name, email, contactId } = req.body;
  const userId = req.user.id; // The ID of the logged-in user

  try {
    // Ensure that contactId refers to an existing user (User B)
    const contactUser = await User.findById(contactId);
    if (!contactUser) {
      return res.status(404).json({ error: 'Contact user not found.' });
    }

    // Check if the contact already exists in the user's contacts (User A)
    const existingContact = await Contact.findOne({ userId, contactId });
    if (existingContact) {
      return res.status(400).json({ error: 'Contact already added.' });
    }

    // Add the contact for User A
    const newContact = new Contact({
      userId,        // User A's ID
      contactId,     // User B's ID
      name: contactUser.username,  // User B's name
      email: contactUser.email,    // User B's email
    });

    await newContact.save();
    console.log('Contact saved for User A:', newContact);

    res.status(201).json(newContact);  // Respond with the new contact
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add contact.' });
  }
});

// Get contacts
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const contacts = await Contact.find({ userId })
      .populate('contactId', 'username email avatar') // Populate contact information
      .exec();

    res.status(200).json(contacts); // Send the response once
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

// Remove contact
router.delete('/remove', authenticate, async (req, res) => {
  const { contactId } = req.body;
  const userId = req.user.id;

  try {
    const contact = await Contact.findOneAndDelete({ userId, contactId });
    if (!contact) {
      return res.status(400).json({ error: 'Contact not found.' });
    }

    res.status(200).json({ message: 'Contact removed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove contact.' });
  }
});

module.exports = router;
