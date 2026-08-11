import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, MessageSquare } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import userStore from "../store/userStore";
import { useNavigate } from "react-router-dom";

function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const { verifyUser, loading } = userStore();
  const navigation = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
   const res = verifyUser({ code });
   if(res){
    navigation("/");
   }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Verify Email form */}
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
            <h1 className="text-2xl font-bold mt-2">Verify Your Email</h1>
            <p className="text-base-content/60 text-center">
              Enter your email to receive the verification code and activate your account.
            </p>
          </div>

          {/* Verify Email Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Code</span>
              </label>
              <div className="flex items-center input input-bordered gap-2 mt-1 w-full">
                <Mail className="w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  required
                  placeholder="******"
                  className="grow bg-transparent focus:outline-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

    
        </div>
      </div>

      {/* Right side - Pattern & message */}
      <AuthImagePattern
        title="Stay Connected"
        subtitle="Verify your email and enjoy full access to our community features."
      />
    </div>
  );
}

export default VerifyEmailPage;
