import React, { useEffect, useRef } from 'react';
import { InfoWindow } from '@react-google-maps/api';
import '../css/custom-infowindow.css';

export const InfoWindowComponent = ({ children, onCloseClick, position }) => {
  const infoWindowRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (infoWindowRef.current && !infoWindowRef.current.contains(e.target)) {
        onCloseClick();
      }
    };
    
    window.addEventListener('mousedown', handleOutsideClick);
    
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [onCloseClick]);

  return (
    <InfoWindow
      position={position}
      onCloseClick={onCloseClick}
    >
      <div ref={infoWindowRef}>
        {children}
      </div>
    </InfoWindow>
  );
};

  