
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCheck,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { apiRequest } from "../../lib/api";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest(
        isSignup ? "/api/auth/signup" : "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify(
            isSignup
              ? { fullName, email, password }
              : { email, password }
          ),
        }
      );

      const token = result?.data?.token;
      const user = result?.data?.user;

      if (!token || !user) {
        throw new Error("The server response is missing login details.");
      }

      localStorage.setItem("taskly_token", token);
      localStorage.setItem("taskly_user", JSON.stringify(user));

      router.push("/");
    } catch (requestError) {
      setError(requestError.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <Link href="/login" className="brand">
          <span className="brand-icon">
            <CheckCheck size={23} />
          </span>
          <span className="brand-name">
            Task<span>ly</span>
          </span>
        </Link>

        <div className="auth-art-content">
          <div className="welcome-kicker">
            <Sparkles size={16} />
            YOUR SPACE. YOUR FOCUS.
          </div>

          <h1>
            Small steps.
            <br />
            Big progress.
          </h1>

          <p>
            Organize your day, keep your priorities clear, and
            celebrate every little thing you get done.
          </p>

          <div className="auth-feature">
            <Check size={17} />
            Simple task management, without the clutter
          </div>

          <div className="auth-feature">
            <ShieldCheck size={17} />
            Your tasks stay linked to your account
          </div>
        </div>

        <div className="auth-art-footer">
          Make room for what matters.
        </div>
      </section>

      <section className="auth-form-side">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="eyebrow">
            {isSignup ? "GET STARTED" : "WELCOME BACK"}
          </div>

          <h2>{isSignup ? "Create your account" : "Let's get things done."}</h2>

          <p className="auth-intro">
            {isSignup
              ? "Create your free account and start organizing your day."
              : "Log in to pick up right where you left off."}
          </p>

          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}

          {isSignup && (
            <label className="auth-field">
              <span className="auth-field-label">Full name</span>
              <input
                className="auth-input"
                type="text"
                placeholder="e.g. Furqan Ahmed"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                maxLength={100}
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span className="auth-field-label">Email address</span>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="auth-field">
            <span className="auth-field-label">Password</span>
            <input
              className="auth-input"
              type="password"
              placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {isSignup && (
            <label className="auth-field">
              <span className="auth-field-label">Confirm password</span>
              <input
                className="auth-input"
                type="password"
                placeholder="Enter your password again"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>
          )}

          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Log in to Taskly"}
            {!loading && <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />}
          </button>

          <div className="auth-switch">
            {isSignup ? "Already have an account? " : "New to Taskly? "}
            <Link href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Log in" : "Create an account"}
            </Link>
          </div>

          <Link className="auth-back" href="/">
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>
        </form>
      </section>
    </main>
  );
}
