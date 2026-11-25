const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

export function validateAuthForm({ email, password, confirmPassword }, { isSignup = false } = {}) {
  const errors = {};

  if (!email.trim()) errors.email ="Enter email.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Incorrect email.";

  if (!password) errors.password = "Enter password.";
  else if (isSignup && password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Minimum ${MIN_PASSWORD_LENGTH} characters.`;

  if (isSignup) {
    if (!confirmPassword) errors.confirmPassword = "Reenter password.";
    else if (confirmPassword !== password) errors.confirmPassword = "The passwords don`t match.";
  }

  return errors;
}