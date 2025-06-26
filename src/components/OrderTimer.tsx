// src/components/OrderTimer.tsx

import { useState, useEffect } from 'react';

interface OrderTimerProps {
  startTime: Date;
}

// Fungsi untuk memformat milidetik menjadi format MM:SS atau HH:MM:SS
const formatDuration = (ms: number) => {
  if (ms < 0) ms = 0;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
  }
  
  return `${paddedMinutes}:${paddedSeconds}`;
};

export default function OrderTimer({ startTime }: OrderTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(Date.now() - startTime.getTime());

  useEffect(() => {
    // Set interval untuk memperbarui waktu setiap detik
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime.getTime());
    }, 1000);

    // Membersihkan interval saat komponen tidak lagi digunakan untuk mencegah memory leak
    return () => {
      clearInterval(timer);
    };
  }, [startTime]);

  return (
    <span className="font-mono tracking-wider text-blue-600 font-semibold">
      {formatDuration(elapsedTime)}
    </span>
  );
}