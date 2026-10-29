import React from "react";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="relative hidden min-h-screen items-center overflow-hidden bg-slate-950 px-16 lg:flex">
      <div className="absolute -right-32 -top-32 size-96 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative z-10 max-w-xl">
        <div className="mb-12 grid grid-cols-3 gap-3 opacity-80">
          {[...Array(9)].map((_, i) => (
            <div key={i} className={`aspect-square rounded-3xl border border-white/10 bg-white/[0.06] ${i % 2 === 0 ? "translate-y-3 bg-blue-400/10" : ""}`} />
          ))}
        </div>
        <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-blue-300">MedSchedule</p>
        <h2 className="text-4xl font-black leading-tight text-white">{title}</h2>
        <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">{subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-3 text-xs font-semibold text-slate-300">
          {["Secure workflows", "Connected teams", "Better care"].map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
