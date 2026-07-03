import { useState } from "react";
import { isRemoteEnabled } from "../lib/supabase";
import type { AuthApi } from "../hooks/useAuth";
import AuthModal from "./AuthModal";

interface AuthBarProps {
  auth: AuthApi;
}

// Compact account strip. The actual sign-in form lives in a modal opened from
// the "Sign in" button.
export default function AuthBar({ auth }: AuthBarProps) {
  const [open, setOpen] = useState(false);

  // No backend configured, or the initial session is still resolving.
  if (!isRemoteEnabled || !auth.ready) return null;

  return (
    <div className="authbar">
      {!auth.isGuest && auth.email ? (
        <>
          <span className="authbar-status">
            Saving to <strong>{auth.email}</strong>
          </span>
          <button className="authbar-link" onClick={() => void auth.signOut()}>
            Sign out
          </button>
        </>
      ) : (
        <>
          <span className="authbar-status">
            Playing as a <strong>guest</strong> — saved on this device.
          </span>
          <button className="btn solid authbar-signin" onClick={() => setOpen(true)}>
            Sign in
          </button>
        </>
      )}

      {open ? <AuthModal auth={auth} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
