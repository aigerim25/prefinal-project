import { useState } from "react";
import { validateAuthForm } from "../utils/validateAuthForm";

export default function AuthForm({ isSignup = false, submitLabel, pending, serverError, onSubmit, onChange }) {
  const [values, setValues] = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    onChange?.();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateAuthForm(values, { isSignup });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(values.email.trim(), values.password);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label>
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </label>

      <label>
        Пароль
        <input
          type="password"
          name="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={values.password}
          onChange={handleChange}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <span className="field-error">{errors.password}</span>}
      </label>

      {isSignup && (
        <label>
          Повторите пароль
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </label>
      )}

      {serverError && <p className="form-error" role="alert">{serverError}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Подождите…" : submitLabel}
      </button>
    </form>
  );
}
