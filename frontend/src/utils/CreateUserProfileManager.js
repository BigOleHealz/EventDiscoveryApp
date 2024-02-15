import React, { useState, useEffect, useContext } from 'react';
import { AuthenticationContext, UserSessionContext } from './Contexts';
import { useCreatePersonNode } from './Hooks';
import { CreateUsernameModal, SelectInterestsModal } from '../composite_components/Modals';

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
