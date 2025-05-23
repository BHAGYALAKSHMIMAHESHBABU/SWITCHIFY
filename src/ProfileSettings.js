import React, { useState } from 'react';
import './ProfileSettings.css';

const ProfileSettings = ({ onClose, setProfileImage, setShowProfileModal }) => {

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('profilePic', imageFile);

    const token = sessionStorage.getItem('currentToken');

    try {
      const response = await fetch('http://localhost:5000/api/profile/image', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type manually!
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:',data);
      
      if (response.ok) {
        // Update profile image in parent
        setProfileImage(data.profileImage);
        // Optionally close the modal
        setShowProfileModal(false);
      } else {
        console.error('Upload failed:', data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="profile-settings-overlay">
      <div className="profile-settings-modal">
        <h2>Change Profile Picture</h2>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {previewUrl && <img src={previewUrl} alt="Preview" className="preview-img" />}
        <div className="profile-settings-actions">
          <button onClick={handleUpload}>Upload</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
 // const handleUpload = () => {
  //   if (imageFile) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const base64Image = reader.result;
  //       handleProfileImageUpload(base64Image); // Pass base64 image to App
  //     };
  //     reader.readAsDataURL(imageFile);
  //   }
  // };