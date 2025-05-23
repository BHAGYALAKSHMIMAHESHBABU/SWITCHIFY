import { useNavigate } from 'react-router-dom';

function SignOut() {
    const navigate = useNavigate();

  const handleSignOut = () => {
    // Remove the token from local storage (or cookies)
    localStorage.removeItem('token');

    // Optionally, clear any user data stored in the app state
    // For example, you can reset your app's context or state management here

    // Redirect the user to the login page
    navigate('/login');
  };

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
}

export default SignOut;
