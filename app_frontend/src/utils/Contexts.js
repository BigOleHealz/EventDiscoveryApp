import React, { useState } from 'react';

export const AttendEventContext = React.createContext();

export const CreateEventContext = React.createContext();

export const CreateUserProfileContext = React.createContext();

export const GoogleMapsApiKeyContext = React.createContext();

export const GoogleClientIdContext = React.createContext();

export const UserAuthContext = React.createContext();

export const UserSessionContext = React.createContext();

export const LoggerContext = React.createContext();

export const CreateEventProvider = ({ children }) => {
  const [create_event_context, setCreateEventContextState] = useState({});

  const setCreateEventContext = (newValues) => {
    setCreateEventContextState(prevState => ({
      ...prevState,
      ...newValues
    }));
  };

  return (
    <CreateEventContext.Provider value={{ create_event_context, setCreateEventContext }}>
      {children}
    </CreateEventContext.Provider>
  );
};
