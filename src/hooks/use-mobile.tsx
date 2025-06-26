// src/hooks/use-mobile.tsx

import * as React from "react"

// Atur batas piksel untuk dianggap sebagai perangkat seluler
const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Pastikan kode ini hanya berjalan di browser
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    
    // Fungsi untuk mengubah state
    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    // Panggil sekali saat komponen dimuat untuk mengatur state awal
    handleResize();

    // Tambahkan listener untuk mendeteksi perubahan ukuran jendela
    mediaQuery.addEventListener("change", handleResize);

    // Hapus listener saat komponen tidak lagi digunakan untuk mencegah kebocoran memori
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return isMobile;
}