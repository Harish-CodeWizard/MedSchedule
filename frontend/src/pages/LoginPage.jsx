import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, ShieldCheck, Stethoscope, ClipboardList, FlaskConical, ScanLine, Pill, UserRound } from 'lucide-react';
import AuthImagePattern from '../components/AuthImagePattern';
import userStore from '../store/userStore';
import { dashboardPathForRole } from "../utils/navigation";

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
    if (success) navigate(dashboardPathForRole(userStore.getState().user?.role));
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@medschedule.demo', icon: ShieldCheck, tone: 'text-primary' },
    { role: 'Reception', email: 'reception@medschedule.demo', icon: ClipboardList, tone: 'text-secondary' },
    { role: 'Doctor', email: 'doctor@medschedule.demo', icon: Stethoscope, tone: 'text-accent' },
    { role: 'Lab', email: 'lab@medschedule.demo', icon: FlaskConical, tone: 'text-info' },
    { role: 'X-Ray', email: 'xray@medschedule.demo', icon: ScanLine, tone: 'text-warning' },
    { role: 'Pharmacy', email: 'pharmacy@medschedule.demo', icon: Pill, tone: 'text-success' },
    { role: 'Patient', email: 'patient@medschedule.demo', icon: UserRound, tone: 'text-error' },
  ];

  const handleDemoLogin = async (account) => {
    const credentials = { email: account.email, password: 'Demo@12345' };
    setFormData(credentials);
    const success = await loginUser(credentials);
    if (success) navigate(dashboardPathForRole(userStore.getState().user?.role));
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      {/* Left side - Login form */}
      <div className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="w-full max-w-lg space-y-8">
          {/* Header */}
        <div className="flex flex-col items-center gap-2 group">
  <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/25">
    <MessageSquare className="w-7 h-7" />
  </div>
  <h1 className="text-3xl font-black mt-2 tracking-tight text-slate-900">Welcome back</h1>
  <p className="text-slate-500">
  Sign in to continue to your account
  </p>

</div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="flex h-14 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                <Mail className="w-5 h-5 text-base-content/40" />
                <input
                  type="email"
                  required
                  placeholder="you@gmail.com"
                  className="grow bg-transparent text-slate-900 outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative mt-1">
                {/* Lock icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="w-5 h-5 text-base-content/40" />
                </div>
                {/* Input */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="........"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                {/* Eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-base-content/40" />
                  ) : (
                    <Eye className="w-5 h-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Sign in <span className="text-blue-200 transition group-hover:translate-x-1">→</span></>
              )}
            </button>
          </form>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="mb-1 flex items-center justify-between"><p className="text-sm font-bold text-slate-900">Explore with a demo account</p><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Ready</span></div>
            <p className="mb-4 text-xs text-slate-500">Choose a workspace to sign in instantly. All demos use the same password.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleDemoLogin(account)}
                    disabled={loading}
                    className="flex min-h-14 items-center justify-start gap-3 rounded-2xl border border-white bg-white px-3 text-left normal-case shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-wait disabled:opacity-50"
                  >
                    <Icon className={`size-4 ${account.tone}`} />
                    <span className="flex flex-col items-start leading-tight">
                      <span>{account.role}</span>
                      <span className="text-[10px] text-slate-400">Use demo account</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          {/* <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{' '}
              <span onClick={() => handle(role)} className="link link-primary">
                Create account
              </span>
            </p>
          </div> */}
          <div className="text-center">
            <p className="text-base-content/60">
              <Link to="/forgot-password" className="font-semibold text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Pattern & message */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
}

export default LoginPage;
