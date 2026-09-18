import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, ShieldCheck, Stethoscope, ClipboardList, FlaskConical, ScanLine, Pill, UserRound } from 'lucide-react';
import AuthImagePattern from '../components/AuthImagePattern';
import userStore from '../store/userStore';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { loginUser, loading } = userStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(formData);
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

  const useDemoAccount = (account) => {
    const credentials = { email: account.email, password: 'Demo@12345' };
    setFormData(credentials);
    loginUser(credentials);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Login form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
        <div className="flex flex-col items-center gap-2 group">
  <div
    className="size-12 rounded-xl bg-primary/10 flex items-center justify-center
    group-hover:bg-primary/20 transition-colors"
  >
    <MessageSquare className="w-6 h-6 text-primary" />
  </div>
  <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
  <p className="text-base-content/60">
  Sign in to continue to your account
  </p>

</div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="flex items-center input input-bordered gap-2 mt-1 w-full">
                <Mail className="w-5 h-5 text-base-content/40" />
                <input
                  type="email"
                  required
                  placeholder="you@gmail.com"
                  className="grow bg-transparent focus:outline-none"
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
              <div className="relative w-full mt-1">
                {/* Lock icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="w-5 h-5 text-base-content/40" />
                </div>
                {/* Input */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full pl-10 pr-10"
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
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="space-y-3">
            <div className="divider text-xs uppercase tracking-[0.18em] opacity-60">Demo access</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => useDemoAccount(account)}
                    disabled={loading}
                    className="btn btn-ghost justify-start border border-base-300 hover:border-primary/50 normal-case"
                  >
                    <Icon className={`size-4 ${account.tone}`} />
                    <span className="flex flex-col items-start leading-tight">
                      <span>{account.role}</span>
                      <span className="text-[10px] opacity-50">Use demo account</span>
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
              <Link to="/forgot-password" className="link link-primary">
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
