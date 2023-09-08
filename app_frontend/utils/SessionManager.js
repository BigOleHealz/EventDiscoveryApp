import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUserSession = async (user, setUserSession) => {
  try {
    await AsyncStorage.setItem('userSession', JSON.stringify(user));
    setUserSession(user);
    console.log('User session stored');
  } catch (error) {
    console.error('Error storing user session:', error);
  }
};

// Retrieve user session data
export const getUserSession = async () => {
  try {
      const userSession = await AsyncStorage.getItem('userSession');
      return userSession ? JSON.parse(userSession) : null;
  } catch (error) {
      console.error('Error retrieving user session:', error);
      return null;
  }
};

// Remove user session data (for logout)
export const removeUserSession = async (setUserSession) => {
  try {
      await AsyncStorage.removeItem('userSession');
      setUserSession(null);
  } catch (error) {
      console.error('Error removing user session:', error);
  }
};
