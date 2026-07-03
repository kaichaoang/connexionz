import { useState, useEffect, useRef } from "react";
import type { AuthApi } from "../hooks/useAuth";

interface AuthModalProps {
  auth: AuthApi;
  onClose: () => void;
}

type Mode = "password" | "magic";

export default function AuthModal({ auth, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Once a session exists, the sign-in succeeded — close automatically.
  useEffect(() => {
    if (!auth.isGuest) onClose();
  }, [auth.isGuest, onClose]);

  // Focus the first field; close on Escape.
  useEffect(() => {
    emailRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clearMsgs = () => {
    setError(null);
    setInfo(null);
  };

  const logIn = async () => {
    if (!email.trim() || !password || busy) return;
    setBusy(true);
    clearMsgs();
    const { error } = await auth.logIn(email, password);
    setBusy(false);
    if (error) setError(error);
  };

  const signUp = async () => {
    if (!email.trim() || !password || busy) return;
    setBusy(true);
    clearMsgs();
    const { error, needsConfirm } = await auth.signUp(email, password);
    setBusy(false);
    if (error) setError(error);
    else if (needsConfirm)
      setInfo("Account created — check your email to confirm, then log in.");
  };

  const sendLink = async () => {
    if (!email.trim() || busy) return;
    setBusy(true);
    clearMsgs();
    const { error } = await auth.sendLink(email);
    setBusy(false);
    if (error) setError(error);
    else setInfo("Login link sent — check your inbox, then open it on any device.");
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          {"×"}
        </button>

        <h2 className="modal-title">Sign in</h2>
        <p className="modal-sub">
          Save your progress across devices. You can also keep playing as a guest
          — that's saved on this device only.
        </p>

        <div className="modal-form">
          <input
            ref={emailRef}
            className="authbar-input"
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {mode === "password" ? (
            <input
              className="authbar-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void logIn();
              }}
            />
          ) : null}
        </div>

        <div className="authbar-actions">
          {mode === "password" ? (
            <>
              <button
                className="btn solid authbar-send"
                onClick={() => void logIn()}
                disabled={busy}
              >
                {busy ? "…" : "Log in"}
              </button>
              <button
                className="btn ghost authbar-send"
                onClick={() => void signUp()}
                disabled={busy}
              >
                Sign up
              </button>
              <button
                className="authbar-link"
                onClick={() => {
                  setMode("magic");
                  clearMsgs();
                }}
              >
                Email me a link instead
              </button>
            </>
          ) : (
            <>
              <button
                className="btn solid authbar-send"
                onClick={() => void sendLink()}
                disabled={busy}
              >
                {busy ? "Sending…" : "Send link"}
              </button>
              <button
                className="authbar-link"
                onClick={() => {
                  setMode("password");
                  clearMsgs();
                }}
              >
                Use a password instead
              </button>
            </>
          )}
        </div>

        {error ? <span className="authbar-error">{error}</span> : null}
        {info ? <span className="authbar-info">{info}</span> : null}
      </div>
    </div>
  );
}
