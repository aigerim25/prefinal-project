import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

export function useThunkMutation(thunk) {
  const dispatch = useDispatch();
  const [state, setState] = useState({ status: "idle", data: undefined, error: null });

  const mutateAsync = useCallback(
    async (variables) => {
      setState({ status: "pending", data: undefined, error: null });
      try {
        const data = await dispatch(thunk(variables)).unwrap();
        setState({ status: "success", data, error: null });
        return data;
      } catch (rejected) {
        const error =
          rejected instanceof Error ? rejected : new Error(rejected?.message ?? "Unknown error");
        setState({ status: "error", data: undefined, error });
        throw error;
      }
    },
    [dispatch, thunk],
  );
  const mutate = useCallback(
    (variables, options = {}) => {
      mutateAsync(variables).then(
        (data) => {
          options.onSuccess?.(data, variables);
          options.onSettled?.(data, null, variables);
        },
        (error) => {
          options.onError?.(error, variables);
          options.onSettled?.(undefined, error, variables);
        },
      );
    },
    [mutateAsync],
  );

  const reset = useCallback(() => {
    setState({ status: "idle", data: undefined, error: null });
  }, []);

  return {
    mutate,
    mutateAsync,
    reset,
    data: state.data,
    error: state.error,
    status: state.status,
    isIdle: state.status === "idle",
    isPending: state.status === "pending",
    isSuccess: state.status === "success",
    isError: state.status === "error",
  };
}
