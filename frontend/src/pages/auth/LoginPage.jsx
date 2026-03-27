import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert, Spinner } from "../../components/common";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form);
    if (result.success) navigate("/dashboard");
    else setError(result.error);
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand shadow-glow mb-4">
            <span className="text-white font-display font-bold text-2xl">T</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your TMS account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Alert message={error} />

            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                required
                minLength={8}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            Contact your administrator to get access
          </p>
        </div>
      </div>
    </div>
  );
}
