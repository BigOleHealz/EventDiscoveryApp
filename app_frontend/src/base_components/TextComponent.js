import React from 'react';

export const TextComponent = ({ children, className = '', align = 'center' }) => {
  // Combine Tailwind CSS classes with any custom classes passed via the 'className' prop
  const combinedClassName = `text-component ${className}`;

  return (
    <div className={`text-${align} ${combinedClassName}`}>
      {children}
    </div>
  );
};
