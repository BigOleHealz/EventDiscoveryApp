import { Modal, View, StyleSheet, TouchableWithoutFeedback, ScrollView, FlatList, CheckBox } from 'react-native';
import styles from '../styles';

export const ModalComponent = ({ isVisible, onRequestClose, children }) => {
    return (
      <Modal visible={isVisible} onRequestClose={onRequestClose} animationType="slide" transparent>
        <TouchableWithoutFeedback onPressOut={onRequestClose}>
          <View style={modal_component_styles.backdrop}>
            <View
              onStartShouldSetResponder={() => true}
              style={modal_component_styles.modalContainer}
            >
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
});