// src/hooks/usePersistentState.ts

import { useState, useEffect } from 'react';

// Hook ini berfungsi seperti useState, tetapi secara otomatis menyimpan nilainya
// ke localStorage dan memuatnya kembali saat halaman dibuka.
function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialState;
    } catch (error) {
      console.error("Error reading from localStorage for key:", key, error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      // Setiap kali state berubah, simpan ke localStorage
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage for key:", key, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;