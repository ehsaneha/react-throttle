import { useRef, useEffect, useCallback } from "react";

/**
 * useThrottle
 * @param callback - Function to be throttled
 * @param delay - Time interval in milliseconds
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedCallback = useRef(callback);

  // Update ref if callback changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        savedCallback.current(...args);
      }
      //
      else if (!timeout.current) {
        const remaining = delay - (now - lastCall.current);

        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeout.current = null;
          savedCallback.current(...args);
        }, remaining);
      }
    },
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return throttled as T;
}
