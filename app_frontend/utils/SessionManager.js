import React, { useState, useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { executeCypherQuery } from '../db/DBHandler';
import { GET_USER_INFO } from '../db/queries';

export const RetrieveAndStoreUserSessionData = () => {
  const { loading, error, records, run } = executeCypherQuery(GET_USER_INFO);

  useEffect(() => {
    if (!loading && !error && records.length > 0) {
      const user = records[0];
      storeUserSession(user);
    } else if (error) {
      console.error('Error retrieving user session data:', error);
      // Handle error (e.g., show an error message)
    } else if (loading) {
      console.log('Retrieving user session data...');
      // Handle loading state (e.g., show a loading spinner)
    }
  }, [loading, error, records]);

  return null;
};

export const storeUserSession = async (user) => {
    try {
      await AsyncStorage.setItem('userSession', JSON.stringify(user));
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
export const removeUserSession = async () => {
    try {
        await AsyncStorage.removeItem('userSession');
    } catch (error) {
        console.error('Error removing user session:', error);
    }
};
