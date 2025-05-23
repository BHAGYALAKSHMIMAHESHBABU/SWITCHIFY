import { useState } from "react";
import { Link } from 'react-router-dom';
import "./log.css";

function Login() {
  // const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })  // No need to send username for login
      });
  
      const data = await res.json();
      if (res.ok) {
        // ✅ SAVE token to localStorage
        sessionStorage.setItem('currentUserId', data.userId); // Assuming the response contains `userId`
        
        sessionStorage.setItem('currentToken', data.token);
        sessionStorage.setItem('currentUsername', data.username);  // Store username from response
        sessionStorage.setItem('currentEmail', data.email); // Store email from response
        sessionStorage.setItem('currentAvatar',  data.profileImage || '');

        // ✅ RELOAD the page to update App.js authentication
        window.location.reload();
      } else {
        alert(data.error || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          autoComplete="username" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          autoComplete="current-password"
        />
        <button type="submit">Log In</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}

export default Login;
