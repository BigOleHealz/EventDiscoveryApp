

import React, { useState, useEffect, useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { CreateUsernameModal, SelectInterestsModal } from '../composite_components/Modals';
import { UserSessionContext, AuthenticationContext } from './Contexts';
import { useCreatePersonNode, useFetchGoogleProfile, useAuthenticateUser } from './Hooks';

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


export function CreateUserProfileManager({
  is_active,
  setIsActive,
  ...props
}) {
  const { user_session, setUserSession } = useContext(UserSessionContext);
  const { authentication_context, setAuthenticationContext } = useContext(AuthenticationContext);
  const [create_user_profile_context, setCreateUserProfileContext] = useState({});

  const [is_create_username_modal_visible, setIsCreateUsernameModalVisible] = useState(true);
  const [is_select_interests_modal_visible, setIsSelectInterestsModalVisible] = useState(false);
  const [is_creating_person_node, setIsCreatingPersonNode] = useState(false);

  console.log('CreateUserProfileManager authentication_context = ', authentication_context);
  console.log('CreateUserProfileManager create_user_profile_context = ', create_user_profile_context);

  useEffect(() => {
    setCreateUserProfileContext(authentication_context);
  }, [authentication_context]);

  useCreatePersonNode(is_creating_person_node, create_user_profile_context, setIsCreatingPersonNode, setUserSession, setIsActive);


  const onCreateUserProfileManagerClose = () => {
    const null_context = {};
    setAuthenticationContext(null_context)
    setCreateUserProfileContext(null_context);
    setIsActive(false);
  }

  const handleUsernameAvailable = () => {
    setIsCreateUsernameModalVisible(false);
    setIsSelectInterestsModalVisible(true);
  }

  const handleEventTypesSelected = () => {
    setIsCreatingPersonNode(true);
  };

  return is_active ? (
    <>
      <CreateUsernameModal
        isVisible={is_create_username_modal_visible}
        create_user_profile_context={create_user_profile_context}
        setCreateUserProfileContext={setCreateUserProfileContext}
        onUsernameAvailable={handleUsernameAvailable}
        onRequestClose={onCreateUserProfileManagerClose}
      />
      <SelectInterestsModal
        isVisible={is_select_interests_modal_visible}
        create_user_profile_context={create_user_profile_context}
        setCreateUserProfileContext={setCreateUserProfileContext}
        onSubmitButtonClick={handleEventTypesSelected}
        onRequestClose={onCreateUserProfileManagerClose}
      />
    </>
  ) : null;
}
