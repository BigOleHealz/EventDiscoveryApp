export const storeUserSession = async (user_session_data, setUserSession) => {
  try {
    localStorage.setItem('user_session', JSON.stringify(user_session_data));
    setUserSession(user_session_data);
    console.log('User session stored: ', user_session_data);
  } catch (error) {
    console.error('Error storing user session:', error);
  }
};

// Retrieve user session data
export const getUserSession = () => {
  try {
    const user_session = localStorage.getItem('user_session');
    return user_session ? JSON.parse(user_session) : null;
  } catch (error) {
    console.error('Error retrieving user session:', error);
    return null;
  }
};
// SessionManager.js
export const removeUserSession = () => {

  return () => {
    try {
      localStorage.removeItem('user_session');
      console.log('User session removed');
    } catch (error) {
      console.error('Error removing user session:', error);
    }
  }
};
