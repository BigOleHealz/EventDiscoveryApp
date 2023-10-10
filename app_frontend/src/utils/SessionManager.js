// Using localStorage instead of AsyncStorage

export const storeUserSession = async (user, setUserSession) => {
  try {
    localStorage.setItem('userSession', JSON.stringify(user));
    setUserSession(user);
    console.log('User session stored');
  } catch (error) {
    console.error('Error storing user session:', error);
  }
};

// Retrieve user session data
export const getUserSession = () => {
  try {
    const userSession = localStorage.getItem('userSession');
    return userSession ? JSON.parse(userSession) : null;
  } catch (error) {
    console.error('Error retrieving user session:', error);
    return null;
  }
};

// Remove user session data (for logout)
export const removeUserSession = (setUserSession) => {
  try {
    localStorage.removeItem('userSession');
    setUserSession(null);
  } catch (error) {
    console.error('Error removing user session:', error);
  }
};
