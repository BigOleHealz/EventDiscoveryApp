
import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import BoxComponent from '../base_components/BoxComponent';

import { toolbar_height, modal_component_styles } from '../styles';

const theme = createTheme({
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
        },
      },
    }
  }
});



export const ModalComponent = ({
  isVisible,
  title,
  onRequestClose,
  submitButtonText,
  onSubmitButtonClick,
  children
}) => {
  return (
    <ThemeProvider theme={theme} >
      <Modal
        open={isVisible}
        onClose={onRequestClose}
        sx={modal_component_styles.modalContainer}
      >
        <BoxComponent
          id="box-modal-parent"
          sx={modal_component_styles.parentContainer}>
          <Button onClick={onRequestClose} sx={modal_component_styles.closeButton}>
            <CloseIcon />
          </Button>
          <BoxComponent id="box-modal-title" sx={modal_component_styles.wrapperContainers}>
            <Typography id="typography-modal-title" variant="h6" component="h2" sx={modal_component_styles.title}>
              {title}
            </Typography>
          </BoxComponent>
          <Divider sx={modal_component_styles.divider} />
          <BoxComponent id="box-modal-content" sx={modal_component_styles.contentContainer}>
            {children}
          </BoxComponent>
          <Divider sx={modal_component_styles.divider} />
          <BoxComponent id="box-modal-submit-button" sx={modal_component_styles.wrapperContainers}>
            <Button
              id="button-modal-submit"
              variant="contained"
              onClick={onSubmitButtonClick}
              sx={modal_component_styles.submitButton}
            >
              {submitButtonText}
            </Button>
          </BoxComponent>
        </BoxComponent>
      </Modal >
    </ThemeProvider>
  );
};
