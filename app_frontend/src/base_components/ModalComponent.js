// import React from 'react';
// import { ButtonComponent } from '../base_components/ButtonComponent';
// import { TextComponent } from '../base_components/TextComponent';

// import { modal_component_styles } from '../styles';
// import '../css/modalOverrides.css'

// export const ModalComponent = ({
//   isVisible,
//   title,
//   onRequestClose,
//   submitButtonText,
//   onSubmitButtonClick,
//   children
// }) => {
//   if (!isVisible) return null;
//   return (
//     <div onClick={onRequestClose} className='overlay'>
//       <div
//         onClick={(e) => {
//           e.stopPropagation();
//         }}
//         className='modalContainer'
//       >
//         <div className='modalRight'>
//           <div id="modal-title-container" className="title-container">
//             <TextComponent style={modal_component_styles.title} >
//               {title}
//             </TextComponent>
//           </div>
//           <div className='content-parent'>
//             <div className='content-child'>
//               {children}
//             </div>
//           </div>
//           <div id="submit-button-container" className="submit-button-container">
//             <ButtonComponent
//               title={submitButtonText}
//               onPress={onSubmitButtonClick}
//               isMenuButton={true}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';

// import '../css/modalOverrides.css';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const ModalComponent = ({
  isVisible,
  title,
  onRequestClose,
  submitButtonText,
  onSubmitButtonClick,
  children
}) => {
  return (
    <Modal
      open={isVisible}
      onClose={onRequestClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Box sx={{ marginBottom: 2 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
        </Box>
        <Box sx={{ marginBottom: 2 }}>
          {children}
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            onClick={onSubmitButtonClick}
          >
            {submitButtonText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
