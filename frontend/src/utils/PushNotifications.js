import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCAsXPjZmivIqHtNLB1QrOGu2X6loNzxZ4",
  authDomain: "functionfinder-4661c.firebaseapp.com",
  projectId: "functionfinder-4661c",
  storageBucket: "functionfinder-4661c.appspot.com",
  messagingSenderId: "953901622728",
  appId: "1:953901622728:web:e15f66547c51ee96474cfd",
  measurementId: "G-TFPX3SRLQ7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const getDeviceToken = async () => {
  try {
    // Request permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get the token
    const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
    console.log('Device token:', token);

    // Send the token to your backend
    await sendTokenToBackend(token);

    return token;
  } catch (error) {
    console.error('An error occurred while getting the device token:', error);
    return null;
  }
};

const sendTokenToBackend = async (token) => {
  try {
    const response = await fetch('/api/update_device_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token,
        userId: 'CURRENT_USER_ID' // You need to provide the current user's ID
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to send token to backend');
    }
  } catch (error) {
    console.error('Error sending token to backend:', error);
  }
};