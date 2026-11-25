import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AuthForm from "../components/AuthForm.jsx";

export default function Signup() {
  const { signup, loginWithGoogle, pending, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => clearError, [clearError]);

  async function handleSignup(email, password) {

    const ok = await signup(email, password);
    if (ok) navigate("/profile", { replace: true });
  }

  async function handleGoogle() {
    const ok = await loginWithGoogle();
    if (ok) navigate("/profile", { replace: true });
  }

  return (
    <section className="auth-page">
      <h1>Registration</h1>

      <AuthForm
        isSignup
        submitLabel="Create account"
        pending={pending}
        serverError={error}
        onSubmit={handleSignup}
        onChange={clearError}
      />

      <div className="auth-divider">or</div>

      <button type="button" className="google-btn" onClick={handleGoogle} disabled={pending}>
        Continue with Google
      </button>

      <p>
        Already has account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}