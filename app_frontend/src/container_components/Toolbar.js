import React, { useRef, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { toolbar_styles } from '../styles';

export const Toolbar = ({ onLeftButtonClick, setToolbarHeight }) => {
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (toolbarRef.current) {
      // Set the toolbar height using the prop passed down from HomePage
      setToolbarHeight(toolbarRef.current.offsetHeight);
    }
  }, [toolbarRef, setToolbarHeight]);  // Added setToolbarHeight as a dependency

  return (
    <div
      ref={toolbarRef}
      testid="toolbar"
      style={toolbar_styles.toolbar}
    >
      <ButtonComponent 
        title="Find Events" 
        onPress={onLeftButtonClick} 
        style={toolbar_styles.toolbarButtonLeft} 
      />
    </div>
  );
};
