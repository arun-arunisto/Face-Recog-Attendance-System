import { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

export function useThreePerformance() {
  const { is3DEnabled, set3DEnabled } = useUIStore();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if client prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
      if (event.matches) {
        set3DEnabled(false);
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [set3DEnabled]);

  return {
    is3DActive: is3DEnabled && !prefersReducedMotion,
    prefersReducedMotion,
  };
}
