import { useState, useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { UserSessionContext, AuthenticationContext } from './Contexts';
import { useFetchGoogleProfile, useAuthenticateUser } from './Hooks';

export function AuthenticationManager({setIsCreateUserProfileManagerActive}) {
  const { user_session, setUserSession } = useContext(UserSessionContext);
  const { authentication_context, setAuthenticationContext } = useContext(AuthenticationContext);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [fetchingGoogleProfile, setFetchingGoogleProfile] = useState(false);

  const getGoogleProfile = (response) => {
    setGoogleAccessToken(response.access_token);
    setFetchingGoogleProfile(true);
  };

  const login = useGoogleLogin({
    onSuccess: getGoogleProfile,
    onError: (error) => console.log('Login Failed:', error)
  });

  const resetLoginInfo = () => {
    setAuthenticationContext({});
  };
  
  useFetchGoogleProfile(fetchingGoogleProfile, setFetchingGoogleProfile, googleAccessToken, setAuthenticationContext);
  useAuthenticateUser(authentication_context, setIsCreateUserProfileManagerActive, setUserSession, resetLoginInfo);

  return { login };
}

