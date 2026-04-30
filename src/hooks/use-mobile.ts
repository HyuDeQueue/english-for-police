import { useCallback, useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const subscribe = useCallback((callback: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }, []);

  const getSnapshot = () => {
    return window.innerWidth < MOBILE_BREAKPOINT;
  };

  const getServerSnapshot = () => {
    return false;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
