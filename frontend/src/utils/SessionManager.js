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
    let user_session = undefined;
    const hostname = window.location.hostname
    console.log('hostname:', hostname);
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return {
        Email: "matt.t.healy1994@gmail.com",
        FirstName: "Matt",
        LastName: "Healy",
        Username: "bigolehealz",
        UUID: "be935996-3001-484a-a463-19df4e791959",
        Interests: ["924c9aaf-7881-46d5-8c0a-06ba3c203afd", "5398ab6b-a7fb-41cd-abde-e91ef2771170", "9f730660-bf2e-40a9-9b04-33831eb91471", "501c8388-b139-485e-9095-8bec01fa9945", "29c65158-0a9f-4b14-8606-4f6bd4798e11", "7abfc211-b49b-4572-8646-acb8fdfffb6c", "8e2fa9d6-62d9-4439-a3ce-e22d0efd389f", "1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b"],
      }
    } else {
      user_session = localStorage.getItem('user_session');
      return user_session ? JSON.parse(user_session) : null;
    }

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
