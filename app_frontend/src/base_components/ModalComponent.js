
import React from 'react';
import Divider from '@mui/material/Divider';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import BoxComponent from '../base_components/BoxComponent';



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

const modalStyle = {
  position: 'absolute',
  top: '50%',
  height: { xs: '90%', sm: '85%', md: '80%', lg: '75%', xl: '75%' },
  width: { xs: '95%', sm: '80%', md: '40%', lg: '30%', xl: '25%' },
  borderRadius: { xs: '10px', sm: '15px', md: '20px', lg: '25px', xl: '30px'},
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  padding: 0,
};

const vertical_padding = { xs: "10px", sm: "15px", md: "20px", lg: "25px", xl: "30px" }
const width = { xs: '95%', sm: '80%', md: '40%', lg: '30%', xl: '25%' }


export const ModalComponent = ({
  isVisible,
  title,
  onRequestClose,
  submitButtonText,
  onSubmitButtonClick,
  children
}) => {
  return (
    <ThemeProvider theme={theme}>
      <Modal
        open={isVisible}
        onClose={onRequestClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        id="modal-parent"
        sx={modalStyle}
      >
        <BoxComponent id="box-modal-parent" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: "10px" }}>
          <BoxComponent id="box-modal-title" style={{ display: 'flex', justifyContent: 'center', paddingTop: vertical_padding, paddingBottom: vertical_padding, borderRadius: "10px" }}>
            <Typography id="typography-modal-title" variant="h6" component="h2">
              {title}
            </Typography>
          </BoxComponent>
          <Divider style={{ backgroundColor: 'grey', height: '2px' }} />
          <BoxComponent id="box-modal-content" style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: vertical_padding, paddingBottom: vertical_padding, maxWidth: '100%' }}>
            {children}
          </BoxComponent>
          <Divider style={{ backgroundColor: 'grey', height: '2px' }} />
          <BoxComponent
            id="box-modal-submit-button"
            style={{ display: 'flex', justifyContent: 'center', paddingTop: vertical_padding, paddingBottom: vertical_padding, borderRadius: "10px"  }}>
            <Button
              id="button-modal-submit"
              variant="contained"
              onClick={onSubmitButtonClick}
              sx={{ width: { xs: "80%", sm: "70%", md: "60%", lg: "50%", xl: "40%" }, height: { xs: "40px", sm: "50px", md: "60px", lg: "70px", xl: "80px" } }}
            >
              {submitButtonText}
            </Button>
          </BoxComponent>
        </BoxComponent>
      </Modal >
    </ThemeProvider>
  );
};
