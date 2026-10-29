import React from "react";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="relative hidden min-h-screen items-center overflow-hidden bg-slate-950 px-12 py-10 lg:flex xl:px-20">
      <div className="absolute -right-32 -top-32 size-96 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-blue-950/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">Today at a glance</p>
              <p className="mt-1 text-lg font-bold text-white">Care command center</p>
            </div>
            <span className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><span className="size-2 rounded-full bg-emerald-400" /> Live</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["24", "Appointments", "bg-blue-400"],
              ["128", "Patients", "bg-violet-400"],
              ["18", "Lab tests", "bg-emerald-400"],
            ].map(([value, label, color]) => (
              <div key={label} className="rounded-2xl bg-slate-950/50 p-3">
                <span className={`mb-3 block size-2 rounded-full ${color}`} />
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-[10px] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-blue-300">MedSchedule</p>
        <h2 className="text-3xl font-black leading-tight text-white xl:text-4xl">{title}</h2>
        <p className="mt-4 max-w-md text-base leading-7 text-slate-300">{subtitle}</p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Care team activity</span><span className="text-emerald-300">Live</span>
          </div>
          <div className="mt-4 flex h-10 items-end gap-1.5">
            {[35, 55, 42, 72, 58, 84, 68, 96, 78, 88, 64].map((height, index) => (
              <span key={index} className="flex-1 rounded-t bg-blue-400/80" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-300">
          {["Secure workflows", "Connected teams", "Better care"].map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
