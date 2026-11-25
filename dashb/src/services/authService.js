import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function logOut() {
  return signOut(auth);
}


export function subscribeToAuthChanges(onUser, onError) {
  return onAuthStateChanged(auth, onUser, onError);
}

const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "Incorrect email.",
  "auth/missing-password": "Enter password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/email-already-in-use": "This email is already exist.",
  "auth/weak-password": "Password is too simple: minimum 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "No connection to the server.",
  "auth/popup-blocked": "The browser has blocked the login window. Please allow pop-ups..",
  "auth/account-exists-with-different-credential": "This email is already registered using a different sign-in method.",
  "auth/unauthorized-domain": "This domain has not been added to Authorized domains in Firebase.",
  "auth/operation-not-allowed": "This sign-in method is not enabled in the Firebase Console.",
};

const SILENT_ERRORS = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

export function getAuthErrorMessage(error) {
  if (SILENT_ERRORS.includes(error?.code)) return null;
  return AUTH_ERROR_MESSAGES[error?.code] ?? "Something went wrong. Please try again.";
}