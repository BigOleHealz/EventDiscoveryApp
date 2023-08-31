import {
  Modal,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { modal_component_styles }  from '../styles';

import { TextComponent } from '../base_components/TextComponent';

export const ModalComponent = ({
  isVisible,
  onRequestClose,
  title,
  children,

  menuButton,
}) => {
  return (
    <Modal
      visible={isVisible}
      onRequestClose={onRequestClose}
      animationType="slide"
      transparent
    >
      <TouchableWithoutFeedback onPressOut={onRequestClose}>
        <View TestID="modal-backdrop" style={modal_component_styles.backdrop}>
          <View
            TestID="modal-container"
            onStartShouldSetResponder={() => true}
            style={modal_component_styles.modalContainer}
          >
            <View
              TestID="view-modal-title"
              style={modal_component_styles.titleContainer}
            >
              <TextComponent style={modal_component_styles.title}>
                {title}
              </TextComponent>
            </View>
            <View TestID="view-modal-childen" style={modal_component_styles.contentContainer}>
              {children}
            </View>
            <View TestID="view-submit-button" style={modal_component_styles.submit_button_container}>
              {menuButton}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
