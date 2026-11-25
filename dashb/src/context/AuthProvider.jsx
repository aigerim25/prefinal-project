import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  subscribeToAuthChanges,
  signUp,
  logIn,
  logInWithGoogle,
  logOut,
  getAuthErrorMessage,
} from "../services/authService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        setError(getAuthErrorMessage(err));
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const run = useCallback(async (action) => {
    setError(null);
    setPending(true);
    try {
      await action();
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      setPending(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      pending,
      error,
      isAuthenticated: Boolean(user),
      signup: (email, password) => run(() => signUp(email, password)),
      login: (email, password) => run(() => logIn(email, password)),
      loginWithGoogle: () => run(logInWithGoogle),
      logout: () => run(logOut),
      clearError,
    }),
    [user, loading, pending, error, run, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}