import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const useTokenExpiration = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    const checkExpiration = () => {
      const expirationTime = localStorage.getItem('tokenExpiration');
      if (!expirationTime) return;

      const timeUntilExpiry = parseInt(expirationTime) - Date.now();
      const warningTime = 2 * 60 * 1000; // Show warning 2 minutes before expiry

      if (timeUntilExpiry <= warningTime && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeLeft(Math.ceil(timeUntilExpiry / 1000));

        // Start countdown
        countdownRef.current = setInterval(() => {
          const currentTimeLeft = parseInt(expirationTime) - Date.now();
          if (currentTimeLeft <= 0) {
            setShowWarning(false);
            clearInterval(countdownRef.current);
          } else {
            setTimeLeft(Math.ceil(currentTimeLeft / 1000));
          }
        }, 1000);
      } else if (timeUntilExpiry > warningTime) {
        // Set timeout to show warning
        warningTimeoutRef.current = setTimeout(() => {
          checkExpiration();
        }, timeUntilExpiry - warningTime);
      }
    };

    checkExpiration();

    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const dismissWarning = () => {
    setShowWarning(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    showWarning,
    timeLeft: formatTime(timeLeft),
    dismissWarning,
    logout
  };
};