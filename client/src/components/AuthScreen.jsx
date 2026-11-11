import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { Brand } from "./Brand.jsx";
import { api, session } from "../lib/api.js";

export function AuthScreen({
  onAuthenticated,
  onAuthenticating,
  sessionMessage = "",
}) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const signup = mode === "register";

  async function submit(event, demo = false) {
    event?.preventDefault();
    setError(null);
    const body = demo
      ? { email: "demo@sweety.example", password: "SweetyDemo123!" }
      : fields;
    if (!demo) {
      if (signup && !fields.name.trim())
        return setError({ field: "name", message: "Please enter your name." });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
        return setError({
          field: "email",
          message: "Please enter a valid email address.",
        });
      if (
        !fields.password ||
        (signup &&
          (fields.password.length < 8 ||
            new TextEncoder().encode(fields.password).length > 72))
      ) {
        return setError({
          field: "password",
          message: signup
            ? "Use at least 8 characters and no more than 72 UTF-8 bytes."
            : "Please enter your password.",
        });
      }
    }
    setBusy(true);
    onAuthenticating?.(true);
    try {
      const result = await api(`/auth/${demo ? "login" : mode}`, {
        method: "POST",
        body,
      });
      session.set(result.token);
      onAuthenticated(result.user);
    } catch (failure) {
      setError(failure);
      onAuthenticating?.(false);
    } finally {
      setBusy(false);
    }
  }

  function change(event) {
    setFields({ ...fields, [event.target.name]: event.target.value });
    setError(null);
  }

  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="About Sweety">
        <Brand />
        <div className="auth-story-content">
          <h1>
            A little care.
            <br />A clearer picture.
          </h1>
          <p>
            Your glucose readings, thoughtfully kept.
            <br />
            Make room for one small daily habit.
          </p>
          <div
            className="journal-preview"
            aria-label="Illustrative glucose journal"
          >
            <div className="journal-preview-heading">
              <span>Your daily rhythm</span>
              <span>Illustration</span>
            </div>
            <div className="rhythm-track">
              {["Morning", "Breakfast", "Lunch", "Dinner"].map(
                (label, index) => (
                  <div key={label}>
                    <span
                      className={
                        index < 3 ? "rhythm-step complete" : "rhythm-step"
                      }
                    >
                      {index < 3 ? <Check size={19} /> : <span />}
                    </span>
                    <span>{label}</span>
                  </div>
                ),
              )}
            </div>
            <p>Four moments. One place to keep them.</p>
          </div>
        </div>
        <div className="auth-story-footer">
          <span>A journal for your everyday.</span>
          <span>
            Made with care <span aria-hidden="true">↗</span>
          </span>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-top-link">
          <span>{signup ? "Already have an account?" : "New to Sweety?"}</span>
          <button
            className="text-button"
            onClick={() => {
              setMode(signup ? "login" : "register");
              setError(null);
            }}
            disabled={busy}
          >
            {signup ? "Log in" : "Create an account"} <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="auth-form-wrap">
          <div className="mobile-brand">
            <Brand />
          </div>
          <h2>{signup ? "Start your daily habit." : "Welcome back."}</h2>
          <p className="auth-intro">
            {signup
              ? "A simple space to keep track of your glucose readings."
              : "Your journal is right where you left it."}
          </p>
          {sessionMessage && (
            <p className="error-banner" role="status">
              {sessionMessage}
            </p>
          )}
          <form onSubmit={submit} noValidate className="auth-form">
            {signup && (
              <div className="field">
                <label htmlFor="name">Your name</label>
                <input
                  id="name"
                  name="name"
                  value={fields.name}
                  onChange={change}
                  autoComplete="name"
                  maxLength={100}
                  placeholder="Alex Morgan"
                  aria-invalid={error?.field === "name"}
                  aria-describedby={
                    error?.field === "name" ? "auth-error" : undefined
                  }
                />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={fields.email}
                onChange={change}
                placeholder="you@example.com"
                aria-invalid={error?.field === "email"}
                aria-describedby={
                  error?.field === "email" ? "auth-error" : undefined
                }
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={signup ? "new-password" : "current-password"}
                  value={fields.password}
                  onChange={change}
                  placeholder={
                    signup ? "At least 8 characters" : "Enter your password"
                  }
                  aria-invalid={error?.field === "password"}
                  aria-describedby={
                    error?.field === "password" ? "auth-error" : undefined
                  }
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <p id="auth-error" className="error-message" role="alert">
                {error.message}
              </p>
            )}
            <button className="button auth-submit" disabled={busy}>
              {busy
                ? "Just a moment…"
                : signup
                  ? "Create your account"
                  : "Log in to your journal"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="auth-divider">
            <span>Just looking around?</span>
          </div>
          <button
            className="button secondary demo-button"
            disabled={busy}
            onClick={(event) => submit(event, true)}
          >
            Explore the demo <ArrowUpRight size={16} />
          </button>
          <p className="demo-hint">
            A sample journal to help you get a feel for Sweety.
          </p>
          <p className="privacy-note">
            <LockKeyhole size={14} /> Your readings stay in your account.
          </p>
        </div>
        <p className="auth-bottom">A little care, every day.</p>
      </section>
    </main>
  );
}
