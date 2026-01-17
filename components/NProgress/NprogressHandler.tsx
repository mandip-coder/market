'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/hooks/useLoading';


export default function NProgressHandler() {
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [_,setLoading] = useLoading()

  useEffect(() => {
    setLoading(true)

    timerRef.current = setTimeout(() => {
      setLoading(false)
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setLoading(false)
    };
  }, [pathname]);

  return null;
}
