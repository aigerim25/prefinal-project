import { QueryCache, QueryClient } from "@tanstack/react-query";

export const OFFLINE_ERROR_EVENT = "api:offline-error";
function isNetworkError(error) {
  return !navigator.online || error instanceof TypeError;
}
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const hasNoData = query.state.data === undefined;
      if (hasNoData && isNetworkError(error)) {
        window.dispatchEvent(new CustomEvent(OFFLINE_ERROR_EVENT));
      }
    }
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: "always",
      refetchOnReconnect: true,
  },
},
});