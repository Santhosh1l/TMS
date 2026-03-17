import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert, Spinner } from "../../components/common";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await register({ ...form, role: "EMPLOYEE", status: "ACTIVE" });
    if (result.success) navigate("/dashboard");
    else setError(result.error);
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand shadow-glow mb-4">
            <span className="text-white font-display font-bold text-2xl">T</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">Join the Training Management System</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Alert message={error} />

            <div>
              <label className="label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="input-field" required maxLength={100} />
            </div>

            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className="input-field" required maxLength={160} />
            </div>

            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" className="input-field" required minLength={8} maxLength={64} />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-1" disabled={loading}>
              {loading ? <Spinner size="sm" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand hover:text-brand-light transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
