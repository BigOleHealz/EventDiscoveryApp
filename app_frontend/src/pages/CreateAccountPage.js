import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { CreateUsernameModal, SelectInterestsModal } from '../composite_components/Modals';
import { CreateUserProfileContext } from '../utils/Contexts';
import { useCreatePersonNode } from '../utils/Hooks';
import { create_account_styles } from '../styles';
export function CreateAccountPage() {
  const { create_user_profile_context, setCreateUserProfileContext } = React.useContext(CreateUserProfileContext);

  const [isCreateUsernameModalVisible, setCreateUsernameModalVisible] = useState(true);
  const [isSelectInterestsModalVisible, setIsSelectInterestsModalVisible] = useState(false);
  const [selectedUUIDs, setSelectedUUIDs] = useState([]);

  const [is_creating_person_node, setIsCreatingPersonNode] = useState(false);

  const navigate = useNavigate();

  const handleSelectInterestSubmitButtonClick = (interestUUIDs) => {
    setCreateUserProfileContext({
      ...create_user_profile_context,
      InterestUUIDs: interestUUIDs
    });
    setIsCreatingPersonNode(true);
  };

  useCreatePersonNode(is_creating_person_node, create_user_profile_context, setIsCreatingPersonNode, navigate);

  return (
    <>
      <ToastContainer />
      <div style={create_account_styles.container} id="CreateAccountFullPageContainer">
        <CreateUsernameModal
          isVisible={isCreateUsernameModalVisible}
          setCreateUsernameModalVisible={setCreateUsernameModalVisible}
          onRequestClose={() => setCreateUsernameModalVisible(false)}
          onUsernameAvailable={() => {
            setCreateUsernameModalVisible(false);
            setIsSelectInterestsModalVisible(true);
          }}
        />
        <SelectInterestsModal
          isVisible={isSelectInterestsModalVisible}
          setIsSelectInterestsModalVisible={setIsSelectInterestsModalVisible}
          onSubmitButtonClick={handleSelectInterestSubmitButtonClick}
          updateSelectedUUIDs={setSelectedUUIDs}
        />
      </div>
    </>
  );
}
