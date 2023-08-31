import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigate } from 'react-router-native';
import { ToastContainer, toast } from 'react-toastify';

import { CreateUsernameModal, SelectInterestsModal } from '../container_components/Modals';
import { CreateUserProfileContext, LoggerContext } from '../utils/Contexts';
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

  useEffect(() => {
    if (email) {
      fetch('/api/get_user_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      }).then(res => res.json())
        .then(data => {
          console.log(data);
          if (!data || data.length === 0) {
            toast.success('Welcome New User!');
            console.log('No user data returned for email:', email);
            setCreateUserProfileContext({
              FirstName: first_name,
              LastName: last_name,
              Email: email
            });
            navigate('/create-account');
            return;
          }

          const user = data;
          user.TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          storeUserSession(user);
          setUserSession(user);
          toast.success('Login Successful!');
          console.log('Login Successful');
          logger.info(`Login Successful for email: ${email}`);
          resetLoginInfo();
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while fetching user profile!');
        });
    }
    setEmail(false);
  }, [email]);

  useEffect(() => {
    if (is_creating_person_node) {
      console.log('create_user_profile_context:', create_user_profile_context)
      fetch('/api/create_person_node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: create_user_profile_context.Username,
          Email: create_user_profile_context.Email,
          FirstName: create_user_profile_context.FirstName,
          LastName: create_user_profile_context.LastName,
          InterestUUIDs: create_user_profile_context.InterestUUIDs,
          UUID: create_user_profile_context.UUID
        })
      }).then(res => res.json())
        .then(data => {
          console.log(data);
          if (data.success) {
            toast.success('Account Created Successfully!');
            navigate('/login');
          } else {
            toast.error('Failed to create account: ' + (data.message || 'Unknown error'));
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while creating user profile!');
        });
    }
    setIsCreatingPersonNode(false);
  }, [is_creating_person_node]);


  return (
    <>
      <ToastContainer />
      <View style={[create_account_styles.container]} TestID="CreateAccountFullPageContainer">
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
      </View>
    </>
  );
}
