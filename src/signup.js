import { useState } from "react";
import { Link } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState(''); // State for username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }) // Include username in the request body
      });

      const data = await res.json();
      if (res.ok) {
        alert('Signup successful! 🎉');
      } else {
        alert(data.error || 'Signup failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup}>
        <h2>Signup</h2>
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
          autoComplete="username"
        />
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
          autoComplete="new-password"
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/">Log in</Link></p>
    </div>
  );
}

export default Signup;
