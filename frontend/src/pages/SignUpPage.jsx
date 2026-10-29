import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageSquare,
  User,
  Loader2,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import userStore from "../store/userStore";

function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    uniqueId: "",
    role: role,
  });
    const handle = (role) => {
    navigate("/login", { state: { role } });
  };

  const { registerUser, loading } = userStore();

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (!role) return toast.error("Role missing");
    
    return true;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await registerUser(formData);
    if (result) navigate("/verify-email");
  };



  return (
    <div className="min-h-screen grid bg-slate-50 lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-7">
          <div className="w-full max-w-md space-y-7">
            {/* LOGO */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                  <MessageSquare className="size-7" />
                </div>
              </div>
              <h1 className="text-3xl font-black mt-2 text-slate-900">Create your account</h1>
              <p className="text-slate-500">
 Get started with a secure MedSchedule workspace
              </p>
              <h1 className="mt-3 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-700">{role}</h1>
            </div>

<form onSubmit={handleSubmit} className="space-y-6">
<div className="form-control">
  <label className="label">
    <span className="label-text font-medium">Full Name</span>
  </label>

  <div className="flex items-center input input-bordered mt-1  gap-2 w-full">
    <User className="w-5 h-5 text-base-content/40" />
    <input
      type="text"
      required
      placeholder="Full Name"
      className="grow bg-transparent focus:outline-none"
      value={formData.name}
      onChange={(e) =>
        setFormData({ ...formData, name: e.target.value })
      }
    />
  </div>
</div>


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






<div className="form-control">
  <label className="label">
    <span className="label-text font-medium">Password</span>
  </label>

  <div className="relative w-full mt-1 ">
    {/* Lock icon on the left */}
    <div className="absolute inset-y-0 left-0 pl-3  flex items-center pointer-events-none z-10">
      <Lock className="w-5 h-5 text-base-content/40" />
    </div>

    {/* Input field */}
    <input
      type={showPassword ? "text" : "password"}
      className="input input-bordered w-full pl-10 pr-10"
      placeholder="........"
      value={formData.password}
      onChange={(e) =>
        setFormData({ ...formData, password: e.target.value })
      }
    />

    {/* Eye toggle on the right */}
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


<div className="form-control">
  <label className="label">
    <span className="label-text font-medium">UniqueID</span>
  </label>

  <div className="flex items-center input input-bordered gap-2 mt-1 w-full">
    <Lock className="w-5 h-5 text-base-content/40" />
    <input
      type="text"
      required
      placeholder="........"
      className="grow bg-transparent focus:outline-none"
      value={formData.uniqueId}
      onChange={(e) =>
        setFormData({ ...formData, uniqueId: e.target.value })
      }
    />
  </div>
</div>

<button type="submit" className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
{loading ? (
<>
<Loader2 className="size-5 animate-spin" />
Loading...
</>
):(
<>
Create account <span className="text-blue-200 transition group-hover:translate-x-1">→</span>
</>
)}
</button>



</form>


<div className="text-center">
<p className="text-base-content/60">
Already have an account?{" "}
<span onClick={() => handle(role)} className="cursor-pointer font-semibold text-blue-600 hover:underline">
Sign in
</span>
</p>
</div>


          </div>
        </div>
      </div>


<AuthImagePattern
title="Join our community"
subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
/>

    </div>
  );
}

export default SignUpPage;


