import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AuthForm from "../components/AuthForm.jsx";

export default function Login() {
  const { login, loginWithGoogle, pending, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname
    ? location.state.from.pathname + (location.state.from.search ?? "")
    : "/profile";

  useEffect(() => clearError, [clearError]);

  async function handleLogin(email, password) {
    const ok = await login(email, password);
    if (ok) navigate(redirectTo, { replace: true });
  }

  async function handleGoogle() {
    const ok = await loginWithGoogle();
    if (ok) navigate(redirectTo, { replace: true });
  }

  return (
    <section className="auth-page">
      <h1>Вход</h1>

      <AuthForm
        submitLabel="Log in"
        pending={pending}
        serverError={error}
        onSubmit={handleLogin}
        onChange={clearError}
      />

      <div className="auth-divider">или</div>

      <button type="button" className="google-btn" onClick={handleGoogle} disabled={pending}>
        Sign in with Google
      </button>

      <p>
        No account? <Link to="/signup" state={location.state}>Register</Link>
      </p>
    </section>
  );
}
