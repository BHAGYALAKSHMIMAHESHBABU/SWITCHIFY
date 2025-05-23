import React, { useState, useEffect } from 'react';
import './Contacts.css';

function Contacts({ contacts, setContacts, setSelectedContact, selectedContact, chatMode, theme }) {
  const [newContact, setNewContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactProfile, setContactProfile] = useState(null); // Selected contact's full profile
  const [contactsProfiles, setContactsProfiles] = useState({}); // Map of contactId to full profile

  // Handle adding a new contact
  const handleAddContact = async () => {
    if (!newContact.trim()) return;

    try {
      setError('');
      setLoading(true);

      const token = sessionStorage.getItem('currentToken');
      if (!token) {
        setError('No token found, please log in');
        setLoading(false);
        return;
      }

      const userRes = await fetch(`http://localhost:5000/api/auth/finduser?query=${newContact}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userRes.ok) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const userData = await userRes.json();

      const addContactRes = await fetch('http://localhost:5000/api/contact/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.username,
          email: userData.email,
          contactId: userData._id,
        }),
      });

      if (!addContactRes.ok) {
        setError('Failed to add contact');
        setLoading(false);
        return;
      }

      const newContactData = {
        contactId: {
          _id: userData._id,
          username: userData.username,
          email: userData.email,
          profileImage: userData.profileImage || '',
        },
      };

      setContacts((prev) => [...prev, newContactData]);
      setNewContact('');
    } catch (error) {
      setError('Error adding contact');
    } finally {
      setLoading(false);
    }
  };

  // Fetch selected contact's full profile whenever selection changes
  useEffect(() => {
    async function fetchProfile() {
      if (!selectedContact) {
        setContactProfile(null);
        return;
      }

      const contactUserId = selectedContact.contactId?._id;
      if (!contactUserId) {
        setContactProfile(null);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/user/${contactUserId}`);
        if (!res.ok) throw new Error('Profile fetch failed');
        const profileData = await res.json();
        setContactProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch contact profile:', error);
        setContactProfile(null);
      }
    }

    fetchProfile();
  }, [selectedContact]);

  // Fetch all contacts' full profiles on contacts change to show their profile images upfront
  useEffect(() => {
    async function fetchAllProfiles() {
      if (!contacts || contacts.length === 0) {
        setContactsProfiles({});
        return;
      }

      try {
        const profiles = await Promise.all(
          contacts.map(async (contact) => {
            const id = contact.contactId._id;
            const res = await fetch(`http://localhost:5000/api/user/${id}`);
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            return { id, data };
          })
        );

        const profilesMap = {};
        profiles.forEach(({ id, data }) => {
          profilesMap[id] = data;
        });

        setContactsProfiles(profilesMap);
      } catch (error) {
        console.error('Error fetching contacts profiles:', error);
        setContactsProfiles({});
      }
    }

    fetchAllProfiles();
  }, [contacts]);

  return (
    <div className={`contacts-container ${theme} ${chatMode.toLowerCase()}-mode`}>
      {/* Add Contact */}
      <div className="add-contact-bar">
        <input
          type="text"
          value={newContact}
          onChange={(e) => setNewContact(e.target.value)}
          placeholder="Enter username or email"
        />
        {loading ? (
          <p>Loading...</p>
        ) : (
          <button onClick={handleAddContact}>Add Contact</button>
        )}
      </div>
      {error && <p className="error">{error}</p>}

      {/* Contacts List */}
      <div className="contacts-list">
        {contacts.map((contact) => (
          <div
            key={contact.contactId._id}
            className={`contact-card ${
              selectedContact?.contactId?._id === contact.contactId._id ? 'selected' : ''
            }`}
            onClick={() => {
              console.log('Selected contact:', contact);
              setSelectedContact(contact);
            }}
          >
            <div className="contact-card-content">
              <img
                src={
                  contactsProfiles[contact.contactId._id]?.profileImage
                    ? `http://localhost:5000${contactsProfiles[contact.contactId._id].profileImage}`
                    : '/default.png'
                }
                alt="avatar"
                className="contact-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default.png';
                }}
              />
              <div className="contact-name">{contact.contactId.username}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Contacts;
