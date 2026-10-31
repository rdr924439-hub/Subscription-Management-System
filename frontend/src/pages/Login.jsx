
import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {
    event.preventDefault();
    alert(`Login form submitted for ${email}`);
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-icon">S</div>
          <span>Subscript</span>
        </div>

        <h1>Welcome back</h1>
        <p className="login-subtitle">
          Sign in to manage your subscriptions.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <div className="login-options">
            <a href="#forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>

        <p className="signup-prompt">
          Don't have an account? <a href="#register">Create an account</a>
        </p>

        <p className="login-footer">
          Subscription Management System
        </p>
      </section>
    </main>
  );
}
