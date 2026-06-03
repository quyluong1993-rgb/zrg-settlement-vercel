import { useState, useEffect } from 'react';

export function useExchangeRate(initialRate: number = 3800) {
  const [rate, setRate] = useState<number>(initialRate);

  // Future feature: Fetch from API
  const fetchApiRate = async () => {
    // Mock API call
    console.log("Fetching rate from API...");
    setRate(3850);
  };

  return { rate, setRate, fetchApiRate };
}
