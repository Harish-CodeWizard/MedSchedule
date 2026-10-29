
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Stethoscope,
  ShieldCheck,
  ClipboardList,
  FlaskConical,
  ScanLine,
  Pill,
  UserRound,
} from 'lucide-react';

import AuthImagePattern from '../components/AuthImagePattern';
import userStore from '../store/userStore';
import { dashboardPathForRole } from '../utils/navigation';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { loginUser, loading } = userStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await loginUser(formData);

    if (success) {
      navigate(
        dashboardPathForRole(userStore.getState().user?.role)
      );
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@medschedule.demo', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { role: 'Reception', email: 'reception@medschedule.demo', icon: ClipboardList, color: 'text-pink-600', bg: 'bg-pink-50' },
    { role: 'Doctor', email: 'doctor@medschedule.demo', icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50' },
    { role: 'Lab', email: 'lab@medschedule.demo', icon: FlaskConical, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { role: 'X-Ray', email: 'xray@medschedule.demo', icon: ScanLine, color: 'text-amber-600', bg: 'bg-amber-50' },
    { role: 'Pharmacy', email: 'pharmacy@medschedule.demo', icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { role: 'Patient', email: 'patient@medschedule.demo', icon: UserRound, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const handleDemoLogin = async (account) => {
    const credentials = {
      email: account.email,
      password: 'Demo@12345',
    };

    setFormData(credentials);

    const success = await loginUser(credentials);

    if (success) {
      navigate(
        dashboardPathForRole(userStore.getState().user?.role)
      );
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f4f7fb] lg:h-dvh lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">

      {/* Left side: Sign in */}
      <main className="flex min-h-0 flex-col justify-start overflow-y-auto px-5 py-6 sm:px-10 lg:px-8 xl:px-14">
        <div className="mx-auto w-full max-w-md space-y-3">

          {/* Header */}
          <header className="flex flex-col items-center text-center">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Stethoscope size={23} />
            </div>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back
            </h1>

            <p className="text-sm text-slate-500">
              Sign in to continue to your account
            </p>
          </header>

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-2.5 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40 sm:p-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                <Mail size={18} className="shrink-0 text-slate-400" />

                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="you@example.com"
                  className="h-full min-w-0 grow bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                <Lock size={18} className="shrink-0 text-slate-400" />

                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="h-full min-w-0 grow bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="shrink-0 rounded-md p-1 text-slate-400 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 sm:p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Try a demo account
              </h2>

              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                Available
              </span>
            </div>

            <p className="mb-3 text-xs leading-5 text-slate-500">
              Select a role to sign in with the demo credentials.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {demoAccounts.map((account) => {
                const Icon = account.icon;

                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleDemoLogin(account)}
                    disabled={loading}
                    className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 text-left transition hover:border-blue-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${account.bg} ${account.color}`}
                    >
                      <Icon size={16} />
                    </span>

                    <span className="truncate text-xs font-semibold text-slate-700">
                      {account.role}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              All demo accounts use the same password.
            </p>
          </section>

          <p className="pb-1 text-center text-xs text-slate-400">
            MedSchedule · Digital Outpatient Management System
          </p>
        </div>
      </main>

      {/* Right side: Keep your existing theme and component */}
      <AuthImagePattern
        title="Your healthcare, connected"
        subtitle="A single platform for appointments, doctors, diagnostics and patient care."
      />
    </div>
  );
}

export default LoginPage;
