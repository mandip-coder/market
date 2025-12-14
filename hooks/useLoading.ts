import NProgress from "nprogress";
import { useEffect, useState, Dispatch, SetStateAction } from "react";

export type UseLoadingReturn = [boolean, Dispatch<SetStateAction<boolean>>];

/**
 * useLoading - Manages a loading state and syncs it with NProgress.
 *
 * @returns [loading, setLoading]
 *  - loading: boolean — whether loading is active
 *  - setLoading: function — call with `true` to start, `false` to stop
 *
 * Example:
 * const [loading, setLoading] = useLoading();
 * setLoading(true); // shows progress bar
 */
export function useLoading(): UseLoadingReturn {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);

  return [loading, setLoading];
}
