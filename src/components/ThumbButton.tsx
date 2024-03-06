import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

interface ButtonProps {
    up: boolean;
    selected: boolean;
    onClick: () => void;
  }

const ThumbButton: React.FC<ButtonProps> = ({up, selected, onClick}) => {
  const icon = up ? faThumbsUp : faThumbsDown;

  return (
    <button 
    onClick={onClick}
    className={`rounded-full px-2 py-1 mx-2 ${
      selected ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'
    }`}>
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};

export default ThumbButton;