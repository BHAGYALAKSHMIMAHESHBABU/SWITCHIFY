import React, { useEffect, useState, useRef } from 'react';
import createSocket from './sock';
import FilePreview from "./FilePreview";
import './Chat.css';

const socket = createSocket();

const Chat = ({ selectedContact, chatMode, profileImage, handleProfileImageUpload }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [contactProfile, setContactProfile] = useState(null);  // <-- local state now
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);

  // Set current user ID from sessionStorage
  useEffect(() => {
    const id = sessionStorage.getItem('currentUserId');
    if (id) {
      setCurrentUserId(id);
    } else {
      console.error('No currentUserId found in sessionStorage');
    }
  }, []);

  // Fetch contact profile when selectedContact changes
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

  // Get previous messages when selectedContact or chatMode changes
  useEffect(() => {
    if (!selectedContact || !currentUserId) return;

    socket.emit('get previous messages', {
      contactId: selectedContact.contactId._id,
      chatMode: (chatMode || 'friendly').toLowerCase(),
    });

    const handlePreviousMessages = (msgs) => setMessages(msgs);
    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    const handleTyping = ({ from }) => {
      if (from === selectedContact.contactId._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };
    const handleStopTyping = ({ from }) => {
      if (from === selectedContact.contactId._id) {
        setIsTyping(false);
      }
    };

    socket.on('previous messages', handlePreviousMessages);
    socket.on('chat message', handleChatMessage);
    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('previous messages', handlePreviousMessages);
      socket.off('chat message', handleChatMessage);
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [selectedContact, currentUserId, chatMode]);

  // Send message with file handling (unchanged)
  const sendMessage = async () => {
    if (!messageInput.trim() && !file) return;

    let uploadedFileName = null;
    if (file) {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`File upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        uploadedFileName = result.filename;
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please try again.');
        return;
      } finally {
        setUploadingFile(false);
      }
    }

    socket.emit('chat message', {
      mode: chatMode || 'friendly',
      receiverId: selectedContact.contactId._id,
      text: messageInput,
      file: uploadedFileName || null,
    });

    setMessageInput('');
    setFile(null);
  };

  // Typing indicator logic (unchanged)
  const handleTyping = () => {
    if (!currentUserId) return;
    socket.emit('typing', selectedContact.contactId._id);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop typing', selectedContact.contactId._id);
    }, 3000);
  };

  // File validation (unchanged)
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/x-pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (selected && selected.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    if (selected && !allowedTypes.includes(selected.type)) {
      alert('Unsupported file type.');
      return;
    }
    setFile(selected);
  };

  // Enter key to send (unchanged)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom on new messages (unchanged)
  useEffect(() => {
    if (messagesEndRef.current) {
      const isAtBottom =
        messagesEndRef.current.getBoundingClientRect().top <= window.innerHeight;
      if (isAtBottom) {
        messagesEndRef.current.scrollIntoView({
          behavior: messages.length > 1 ? 'smooth' : 'auto',
        });
      }
    }
  }, [messages]);

  if (!selectedContact) {
    return <div>Please select a contact to start chatting.</div>;
  }

  return (
    <div className="chat">
      <div className="messages-area">
        <div className="member-info">
          <img
            src={
              contactProfile?.profileImage
                ? `http://localhost:5000${contactProfile.profileImage}`
                : '/default.png'
            }
            alt="User"
            className="profile-preview"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default.png';
            }}
          />
          <div>
            <div className="name">{contactProfile?.username || selectedContact.contactId.username}</div>
            {/* <div className="email">{contactProfile?.email || ''}</div> */}
          </div>
        </div>
        <div className="member-info-spacer" />

        {messages.map((msg, index) => {
          const senderId = (msg.senderId?._id || msg.senderId || '').toString();
          const isCurrentUser = senderId === currentUserId;

          return (
            <div key={index} className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
              <div className="message-content">{msg.text || ''}</div>
              {msg.file && <FilePreview file={msg.file} isSender={isCurrentUser} />}

              <div className="message-time">
                {msg.timestamp
                  ? new Date(msg.timestamp).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : ''}
              </div>
            </div>
          );
        })}

        {isTyping && <p>{contactProfile?.username || selectedContact.contactId.username} is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="send-message">
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onInput={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={uploadingFile}
          rows="2"
        />
        <input type="file" onChange={handleFileChange} />
        {file && <p className="selected-file">📄 {file.name}</p>}
        {uploadingFile && <p>Uploading file... ⏳</p>}
        <button onClick={sendMessage} disabled={uploadingFile}>
          {uploadingFile ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chat;
