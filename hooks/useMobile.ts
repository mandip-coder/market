'use client'
import { useEffect, useState } from "react";

export default function useMobile(size=768) {
  const [isMobile, setIsMobile] = useState(false);
  
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${size}px)`);
    setIsMobile(mediaQuery.matches);

    const listener = () => {
      setIsMobile(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return isMobile;
}
