import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  FileHeart,
  HeartPulse,
  Pill,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

const roles = [
  { name: "Admin", icon: ShieldCheck, description: "Manage users, access and reports" },
  { name: "Reception", icon: Clipboard, description: "Register patients and appointments" },
  { name: "Doctor", icon: Stethoscope, description: "Coordinate care and prescriptions" },
  { name: "Lab", icon: Activity, description: "Process tests and results" },
  { name: "X-Ray", icon: ScanLine, description: "Manage imaging and reports" },
  { name: "Pharmacy", icon: Pill, description: "Dispense medicines securely" },
  { name: "Patient", icon: HeartPulse, description: "Follow your care journey" },
];

const capabilities = [
  { icon: CalendarDays, title: "Appointments", text: "Schedule visits, assign doctors and keep every appointment organized." },
  { icon: FileHeart, title: "Clinical records", text: "Keep prescriptions, lab results, imaging and patient history together." },
  { icon: Users, title: "Connected teams", text: "Give every department the role-based tools they need to work together." },
];

function PersonaSelect() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(37,99,235,0.35),transparent_35%),radial-gradient(circle_at_10%_70%,rgba(14,165,233,0.16),transparent_30%)]" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/25">
              <HeartPulse className="size-6" />
            </span>
            <span className="text-xl font-bold tracking-tight">Med<span className="text-blue-400">Schedule</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
              Sign in
            </Link>
            <button type="button" onClick={() => document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" })} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50">
              Get started
            </button>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-200">
              <span className="size-2 rounded-full bg-emerald-400" /> Digital outpatient care, connected
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
              Better care starts with a <span className="text-blue-400">better workflow.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              MedSchedule brings registration, appointments, clinical records, diagnostics and pharmacy operations into one calm, secure workspace.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <button type="button" onClick={() => document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" })} className="group flex items-center gap-3 rounded-2xl bg-blue-500 px-6 py-4 font-bold shadow-xl shadow-blue-500/25 transition hover:-translate-y-1 hover:bg-blue-400">
                Choose your workspace <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </button>
              <Link to="/login" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white transition hover:bg-white/10">
                Sign in to MedSchedule
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {["Role-based access", "Secure records", "One connected team"].map((item) => (
                <span key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-400" />{item}</span>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-500/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-slate-900 p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div><p className="text-sm text-slate-400">Today at a glance</p><p className="mt-1 text-2xl font-bold">Care command center</p></div>
                  <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300"><Activity className="size-6" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 py-5">
                  {[
                    ["Appointments", "24", "bg-blue-400"],
                    ["Patients", "128", "bg-violet-400"],
                    ["Lab tests", "18", "bg-emerald-400"],
                    ["Prescriptions", "36", "bg-amber-400"],
                  ].map(([label, value, color]) => <div key={label} className="rounded-2xl bg-white/5 p-4"><span className={`mb-4 block size-2 rounded-full ${color}`} /><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}
                </div>
                <div className="rounded-2xl bg-blue-500/15 p-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold">Care team activity</span><span className="text-xs text-emerald-300">Live</span></div><div className="mt-4 flex h-16 items-end gap-2">{[35, 54, 42, 72, 58, 84, 68, 96, 78].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-blue-400/80" style={{ height: `${height}%` }} />)}</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 text-slate-900 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="font-bold uppercase tracking-[0.2em] text-blue-600">Everything in one place</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">The work your outpatient team does, connected.</h2><p className="mt-4 text-lg leading-8 text-slate-600">From the first registration to the final prescription, MedSchedule keeps every handoff visible and every team member focused.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">{capabilities.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"><div className="flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600"><Icon className="size-6" /></div><h3 className="mt-6 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p></article>)}</div>
        </div>
      </section>

      <section id="roles" className="bg-slate-50 px-6 py-20 text-slate-900 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="font-bold uppercase tracking-[0.2em] text-blue-600">Start here</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Choose your workspace</h2></div><p className="max-w-md text-slate-600">Select a role to create an account. Already registered? <Link to="/login" className="font-bold text-blue-600 hover:underline">Sign in instead.</Link></p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{roles.map(({ name, icon: Icon, description }) => <button key={name} type="button" onClick={() => navigate("/signup", { state: { role: name } })} className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon className="size-5" /></span><ArrowRight className="size-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" /></div><h3 className="mt-5 font-bold">{name}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></button>)}</div>
        </div>
      </section>
      <footer className="bg-slate-950 px-6 py-8 text-center text-sm text-slate-400">© {new Date().getFullYear()} MedSchedule · Digital Outpatient Management System</footer>
    </main>
  );
}

export default PersonaSelect;
