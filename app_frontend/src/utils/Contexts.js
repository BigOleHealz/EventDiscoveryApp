import React, { useState } from 'react';

export const UserSessionContext = React.createContext({
  userSession: null,
  setUserSession: () => { }
});

export const CreateGameContext = React.createContext();

export const LoggerContext = React.createContext();

export const CreateUserProfileContext = React.createContext();

export const CreateGameProvider = ({ children }) => {
  const [create_game_context, setCreateGameContextState] = useState({});

  const setCreateGameContext = (newValues) => {
    setCreateGameContextState(prevState => ({
      ...prevState,
      ...newValues
    }));
  };

  return (
    <CreateGameContext.Provider value={{ create_game_context, setCreateGameContext }}>
      {children}
    </CreateGameContext.Provider>
  );
};
