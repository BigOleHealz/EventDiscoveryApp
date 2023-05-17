import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import styles from '../styles';

import { TextComponent } from '../base_components/TextComponent';

export const ModalComponent = ({ isVisible, onRequestClose, title, children }) => {
  return (
    <Modal visible={isVisible} onRequestClose={onRequestClose} animationType="slide" transparent>
      <TouchableWithoutFeedback onPressOut={onRequestClose}>
        <View TestID="modal-backdrop" style={modal_component_styles.backdrop}>
          <View
            TestID="modal-container"
            onStartShouldSetResponder={() => true}
            style={modal_component_styles.modalContainer}
          >
            {title && (
              <View TestID="modal-title-container" style={modal_component_styles.titleContainer}>
                <TextComponent>{title}</TextComponent>
              </View>
            )}
            {children}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: styles.appTheme.backgroundColor,
    borderRadius: 10,
  },
  titleContainer: {
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: styles.appTheme.color,
  },
});
