import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './login';
import Signup from './signup';
import Contacts from './Contacts';
import Chat from './Chat';
import ProfileSettings from './ProfileSettings';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState({ username: "", email: "" });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [chatMode, setChatMode] = useState("Friendly");

  const toggleTheme = () => setDarkMode(!darkMode);

  const toggleChatMode = () => {
    setChatMode(prev => prev === "Friendly" ? "Professional" : "Friendly");
  };

  useEffect(() => {
    const token = sessionStorage.getItem('currentToken');
    setIsAuthenticated(!!token);
    if (token) {
      const username = sessionStorage.getItem('currentUsername');
      const email = sessionStorage.getItem('currentEmail');
      const avatar = sessionStorage.getItem('currentAvatar');
      setUserDetails({ username: username || '', email: email || '' });
      if (avatar) setProfileImage(avatar);
      fetchContacts(token);
    }
  }, []);

  const fetchContacts = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      } else {
        console.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact); // Simply set selected contact
  };

  const imageSrc = profileImage
    ? (profileImage.startsWith('http') ? profileImage : `http://localhost:5000${profileImage}`)
    : 'default.png';

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route path="*" element={
            <div className={`app ${darkMode ? "dark" : ""} ${chatMode === "Professional" ? "mode-professional" : "mode-friendly"}`}>
              <header className="app-header">
                <div className="header-left">
                  <div className="dropdown">
                    <button className="dropdown-toggle" onClick={() => setDropdownVisible(!dropdownVisible)}>
                      <img src="app.png" alt="logo" className="app-logo" />
                    </button>
                    <div className={`dropdown-menu ${dropdownVisible ? 'show' : ''}`}>
                      <p><strong>Username:</strong> {userDetails.username}</p>
                      <p><strong>Email:</strong> {userDetails.email}</p>
                      <button onClick={handleSignOut}>Sign Out</button>
                    </div>
                  </div>
                  <h1 className="app-name">Switchify</h1>
                </div>
                <div className="header-right">
                  <div
                    className={`chat-mode-switch-container ${chatMode === "Professional" ? "mode-professional" : "mode-friendly"}`}
                    onClick={toggleChatMode}
                  >
                    <span className="mode-label-left">Friendly</span>
                    <span className="mode-label-right">Professional</span>
                    <div className="mode-slider"></div>
                  </div>
                </div>
              </header>

              {showProfileModal && (
                <ProfileSettings
                  onClose={() => setShowProfileModal(false)}
                  setProfileImage={setProfileImage}
                  setShowProfileModal={setShowProfileModal}
                />
              )}

              <div className="main-content">
                <div className="sidebar">
                  <label className="switch">
                    <input type="checkbox" onChange={toggleTheme} />
                    <span className="slider"></span>
                  </label>
                  <div className="profile-icon-container" onClick={() => setShowProfileModal(true)}>
                    <img
                      src={imageSrc}
                      alt="Profile"
                      className="sidebar-profile-icon"
                    />
                  </div>
                </div>

                <div className="chat-layout">
                  <div className="member-list">
                    <Contacts
                      contacts={contacts}
                      setContacts={setContacts}
                      setSelectedContact={handleContactSelect}
                      selectedContact={selectedContact}
                      theme={darkMode ? "dark-mode" : "light-mode"}
                      chatMode={chatMode}
                    />
                  </div>
                  <div className="chat-page">
                    {selectedContact ? (
                      <Chat
                        selectedContact={selectedContact}
                        chatMode={chatMode}
                        profileImage={profileImage}
                        handleProfileImageUpload={(newUrl) => setProfileImage(newUrl)}
                      />
                    ) : (
                      <div className="no-chat">
                        <h2>Select a contact</h2>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          } />
        )}
      </Routes>
    </Router>
  );
}

export default App;
