import React from 'react';
import { useStore } from '../context/StoreContext';

export const Toast: React.FC = () => {
  const { toastMsg } = useStore();

  return (
    <div
      className={`toast-msg ${toastMsg ? 'show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {toastMsg}
    </div>
  );
};
