import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import styles from '../styles';

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
              TestID="modal-title-container"
              style={modal_component_styles.titleContainer}
            >
              <TextComponent style={modal_component_styles.title}>
                {title}
              </TextComponent>
            </View>
            <View style={modal_component_styles.contentContainer}>
              {children}
            </View>
            <View style={modal_component_styles.submit_button_container}>
              {menuButton}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const modal_component_styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: '80%',
    width: '40%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: styles.appTheme.backgroundColor,
    borderRadius: 10,
  },
  titleContainer: {
    borderBottomWidth: 1,
    borderColor: 'rgba(96, 96, 96, 0.5)',
    padding: 10,
    margin: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: styles.appTheme.color,
  },
  submit_button_container: {
    borderTopWidth: 1,
    borderColor: 'rgba(96, 96, 96, 0.5)',
    padding: 10,
    margin: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
  },
});
