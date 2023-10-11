import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { CreateUsernameModal, SelectInterestsModal } from '../container_components/Modals';
import { CreateUserProfileContext, LoggerContext } from '../utils/Contexts';
import { useCreateUserProfile, useCreatePersonNode } from '../utils/Hooks';
import { create_account_styles }  from '../styles';
import { is } from 'date-fns/locale';

export function CreateAccountPage() {
  const { create_user_profile_context, setCreateUserProfileContext } = React.useContext(CreateUserProfileContext);
  const [isCreateUsernameModalVisible, setCreateUsernameModalVisible] = useState(true);
  const [isSelectInterestsModalVisible, setIsSelectInterestsModalVisible] = useState(false);
  const [selectedUUIDs, setSelectedUUIDs] = useState([]);

  const [ email, setEmail ] = useState(false);

  const [is_creating_person_node, setIsCreatingPersonNode] = useState(false);

  const navigate = useNavigate();

  const handleSelectInterestSubmitButtonClick = (interestUUIDs) => {
    setCreateUserProfileContext({
      ...create_user_profile_context,
      InterestUUIDs: interestUUIDs
    });
    setIsCreatingPersonNode(true);
  };

  useCreateUserProfile(email, create_user_profile_context, setCreateUserProfileContext, setEmail, navigate);
  useCreatePersonNode(is_creating_person_node, create_user_profile_context, setIsCreatingPersonNode, navigate);


  return (
    <React.Fragment>
      <ToastContainer />
      <div style={create_account_styles.container} data-testid="CreateAccountFullPageContainer">
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
          onSubmitButtonClick={handleSelectInterestSubmitButtonClick}  // this is the callback
          updateSelectedUUIDs={setSelectedUUIDs}
        />
      </div>
    </React.Fragment>
  );
}
