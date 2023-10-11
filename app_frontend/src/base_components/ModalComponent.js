import React from 'react';
import Modal from 'react-modal';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';

import { modal_component_styles } from '../styles';

Modal.setAppElement('#root');

export const ModalComponent = ({
  isVisible,
  onRequestClose,
  title,
  children,
  submitButtonText,
  onSubmitButtonClick
}) => {
  return (
    <Modal
      isOpen={isVisible}
      onRequestClose={onRequestClose}
      contentLabel="Example Modal"
    >
      <div id="modal-container" style={modal_component_styles.modalContainer}>
        <div id="modal-title-container" style={modal_component_styles.titleContainer}>
          <TextComponent style={modal_component_styles.title}>
            {title}
          </TextComponent>
        </div>
        <div id="modal-content-container" style={modal_component_styles.contentContainer}>
          {children}
        </div>
        <div id="submit-button-container" style={modal_component_styles.submit_button_container}>
          <ButtonComponent
            title={submitButtonText}
            onPress={onSubmitButtonClick}
            isMenuButton={true}
          />
        </div>
      </div>
    </Modal>
  );
};
