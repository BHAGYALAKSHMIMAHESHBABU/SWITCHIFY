const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, // Ensures that the contact is tied to a specific user
  },
  contactId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, // Ensures that a contact must be a user
  },
  name: { 
    type: String, 
    required: true, // Ensures name is always provided
  },
  email: { 
    type: String, 
    required: true, // Ensures email is always provided
    match: [/.+\@.+\..+/, 'Please enter a valid email address.'], // Optional email format validation
  },

  
  
}, { timestamps: true }); // Optionally, add timestamps to track when contacts are created/updated

module.exports = mongoose.model('Contact', contactSchema);
