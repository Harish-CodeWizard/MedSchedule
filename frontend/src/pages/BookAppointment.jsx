import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, CreditCard, Loader2, ShieldCheck, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import userStore from '../store/userStore';
import patientStore from '../store/patientStore';
import { axiosInstance } from '../lib/axios';

const formatMoney = (value) => `PKR ${Number(value || 0).toLocaleString()}`;

function BookAppointment() {
  const { user } = userStore();
  const { patients, getAllPatients } = patientStore();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('details');
  const [form, setForm] = useState({ doctorId: '', appointmentDate: '', reason: '' });

  const patient = patients.find((item) => item.uniqueID === user?.uniqueId);
  const selectedDoctor = doctors.find((doctor) => doctor._id === form.doctorId);
  const appointmentCharge = Number(selectedDoctor?.ConsultationCharges || 0);
  const minDate = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/user/doctors'),
      getAllPatients(),
    ]).then(([doctorResponse]) => {
      setDoctors(doctorResponse.data.doctors || []);
    }).catch((error) => {
      toast.error(error?.response?.data?.message || 'Unable to load doctors');
    }).finally(() => setLoading(false));
  }, [getAllPatients]);

  const availableDoctors = useMemo(() => doctors.filter((doctor) => (
    doctor.availabilityStatus !== 'Unavailable' && doctor.operationStatus !== 'In Operation'
  )), [doctors]);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const reviewAppointment = (event) => {
    event.preventDefault();
    if (!form.doctorId || !form.appointmentDate) {
      toast.error('Choose a doctor and appointment time');
      return;
    }
    setStep('review');
  };

  const confirmAndPay = async () => {
    if (!patient) {
      toast.error('Your patient profile is not available');
      return;
    }

    setSubmitting(true);
    try {
      const appointmentDate = new Date(form.appointmentDate).toISOString();
      const response = await axiosInstance.put(`/patient/${patient._id}`, {
        doctorAppointment: {
          doctorId: selectedDoctor._id,
          doctorName: selectedDoctor.name,
          appointmentDate,
          appointmentTime: appointmentDate,
          appointmentReason: form.reason,
          charges: appointmentCharge,
          status: 'Pending Payment',
        },
      });

      const updatedAppointment = response.data.patient.doctorAppointment;
      if (appointmentCharge <= 0) {
        toast.success('Appointment booked successfully');
        setStep('complete');
        return;
      }

      const checkout = await axiosInstance.post('/payment/checkout', { type: 'appointment' });
      if (checkout.data.checkoutUrl) window.location.assign(checkout.data.checkoutUrl);
      else setStep('complete');
      return updatedAppointment;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not start appointment payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="grid min-h-[calc(100vh-4rem)] place-items-center"><Loader2 className="size-8 animate-spin text-blue-600" /></div>;

  if (step === 'complete') return (
    <div className="mx-auto max-w-2xl p-6 md:p-10"><div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto size-14 text-emerald-500" /><h1 className="mt-4 text-2xl font-bold">Appointment request received</h1><p className="mt-2 text-slate-600">Your appointment is in the patient dashboard. Payment confirmation will finalize the booking.</p></div></div>
  );

  return (
    <div className="mx-auto max-w-5xl p-4 text-slate-900 md:p-8">
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Patient scheduling</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Book an appointment</h1><p className="mt-2 text-slate-600">Choose a free doctor and time. You will review the charge before secure payment.</p></div>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm font-semibold"><span className={`rounded-full px-4 py-2 ${step === 'details' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>1. Appointment details</span><span className="text-slate-300">/</span><span className={`rounded-full px-4 py-2 ${step === 'review' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2. Review and pay</span></div>
      {step === 'details' ? (
        <form onSubmit={reviewAppointment} className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-700"><Stethoscope className="size-5" /></div><div><h2 className="font-bold text-slate-950">Find your doctor</h2><p className="text-sm text-slate-600">Only available doctors are shown.</p></div></div><label className="mb-2 block text-sm font-semibold text-slate-700">Doctor</label><select name="doctorId" required value={form.doctorId} onChange={updateForm} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"><option value="">Select a doctor</option>{availableDoctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name} · {doctor.SpecialistDoctor || 'General'} · {formatMoney(doctor.ConsultationCharges)}</option>)}</select><label className="mb-2 mt-5 block text-sm font-semibold text-slate-700">Date and time</label><div className="relative"><CalendarClock className="pointer-events-none absolute left-3 top-3 size-5 text-slate-400" /><input name="appointmentDate" type="datetime-local" required min={minDate} value={form.appointmentDate} onChange={updateForm} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div><label className="mb-2 mt-5 block text-sm font-semibold text-slate-700">Reason for visit</label><textarea name="reason" value={form.reason} onChange={updateForm} rows="4" placeholder="Briefly describe what you need help with" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /><button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">Review appointment <CreditCard className="size-4" /></button></section>
          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><h2 className="font-bold text-slate-950">How it works</h2><ol className="mt-4 space-y-4 text-sm text-slate-600"><li><b className="text-slate-900">1.</b> Select an available doctor.</li><li><b className="text-slate-900">2.</b> Choose a time that fits your schedule.</li><li><b className="text-slate-900">3.</b> Review the consultation charge.</li><li><b className="text-slate-900">4.</b> Pay securely to confirm.</li></ol><div className="mt-8 flex gap-2 rounded-xl bg-white p-3 text-xs text-slate-600"><ShieldCheck className="size-4 shrink-0 text-emerald-600" /> Your appointment is reassigned automatically if the doctor becomes unavailable.</div></aside>
        </form>
      ) : (
        <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-950">Review and pay</h2><div className="mt-5 grid gap-6 md:grid-cols-[1fr_210px]"><div className="divide-y divide-slate-100 rounded-xl border border-slate-200"><div className="flex justify-between p-4"><span className="text-slate-500">Doctor</span><b className="text-slate-900">{selectedDoctor?.name}</b></div><div className="flex justify-between p-4"><span className="text-slate-500">Specialization</span><b className="text-slate-900">{selectedDoctor?.SpecialistDoctor || 'General'}</b></div><div className="flex justify-between p-4"><span className="text-slate-500">Appointment</span><b className="text-right text-slate-900">{new Date(form.appointmentDate).toLocaleString()}</b></div><div className="flex justify-between p-4 text-lg"><span>Consultation charge</span><b className="text-blue-700">{formatMoney(appointmentCharge)}</b></div></div><div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><QRCodeSVG value={`DEMO-MEDSCHEDULE|${selectedDoctor?._id}|${form.appointmentDate}|${appointmentCharge}`} size={150} bgColor="#ffffff" fgColor="#0f172a" level="M" /><p className="mt-3 text-center text-xs font-semibold text-slate-700">Demo payment QR</p><p className="mt-1 text-center text-[11px] leading-4 text-slate-500">Visual demo only. Use Stripe Checkout for real payment.</p></div></div><p className="mt-4 text-sm text-slate-600">After payment, your appointment will be confirmed in your patient dashboard.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => setStep('details')} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">Edit details</button><button type="button" onClick={confirmAndPay} disabled={submitting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />} Continue to secure payment</button></div></section>
      )}
    </div>
  );
}

export default BookAppointment;
