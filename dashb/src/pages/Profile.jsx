import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user, logout, pending, error } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const ok = await logout();
    if (ok) navigate("/login", { replace: true });
  }

  const provider = user.providerData[0]?.providerId === "google.com" ? "Google" : "Email and password";

  return (
    <section className="profile-page">
      <h1>Profile</h1>

      {user.photoURL && <img className="avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />}

      <dl className="profile-info">
        {user.displayName && (
          <>
            <dt>Имя</dt>
            <dd>{user.displayName}</dd>
          </>
        )}
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>UID</dt>
        <dd><code>{user.uid}</code></dd>
        <dt>Login method</dt>
        <dd>{provider}</dd>
        <dt>Account created</dt>
        <dd>{new Date(user.metadata.creationTime).toLocaleDateString()}</dd>
      </dl>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button type="button" onClick={handleLogout} disabled={pending}>
        {pending ? "Exit…" : "Log out"}
      </button>
    </section>
  );
}
