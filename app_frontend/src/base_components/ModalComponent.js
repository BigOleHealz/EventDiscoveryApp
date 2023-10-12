import React from 'react';
import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';

import { modal_component_styles } from '../styles';
import '../css/modalOverrides.css'

export const ModalComponent = ({
  isVisible,
  title,
  onRequestClose,
  submitButtonText,
  onSubmitButtonClick,
  children
}) => {
  if (!isVisible) return null;
  return (
    <div onClick={onRequestClose} className='overlay'>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className='modalContainer'
      >
        <div className='modalRight'>
          <div id="modal-title-container" className="title-container">
            <TextComponent style={modal_component_styles.title} >
              {title}
            </TextComponent>
          </div>
          <div className='content-parent'>
            <div className='content-child'>
              {children}
            </div>
          </div>
          <div id="submit-button-container" className="submit-button-container">
            <ButtonComponent
              title={submitButtonText}
              onPress={onSubmitButtonClick}
              isMenuButton={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
