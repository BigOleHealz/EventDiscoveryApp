import React from 'react';
import { text_component_styles } from '../styles';

export const TextComponent = ({ children, style, align = 'center' }) => {
  return (
    <div style={{ textAlign: align, ...text_component_styles.view, ...style }}>
      {children}
    </div>
  );
};
