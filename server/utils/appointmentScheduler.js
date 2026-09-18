import Patient from '../models/PatientModel.js';
import User from '../models/userModel.js';

const toDate = (value) => value ? new Date(value) : null;

const minutesPerAppointment = (doctor) => {
  const value = Number.parseInt(doctor.ConsultationTimePerPatient, 10);
  return Number.isFinite(value) && value > 0 ? value : 30;
};

const isUnavailable = (doctor, appointmentDate) => {
  if (doctor.availabilityStatus === 'Unavailable' || doctor.operationStatus === 'In Operation') return true;
  const date = toDate(appointmentDate);
  const unavailableFrom = toDate(doctor.unavailableFrom);
  const unavailableUntil = toDate(doctor.unavailableUntil);
  return Boolean(date && unavailableFrom && date >= unavailableFrom && (!unavailableUntil || date <= unavailableUntil));
};

const hasConflict = (doctor, appointmentDate, patients) => {
  const requested = toDate(appointmentDate);
  if (!requested) return false;
  const slotWindow = minutesPerAppointment(doctor) * 60 * 1000;
  return patients.some((patient) => {
    const appointment = patient.doctorAppointment;
    if (!appointment || appointment.status === 'Cancelled' || String(appointment.doctorId) !== String(doctor._id)) return false;
    const existing = toDate(appointment.appointmentDate);
    return existing && Math.abs(existing.getTime() - requested.getTime()) < slotWindow;
  });
};

export const findAvailableDoctor = async ({ appointmentDate, excludeDoctorId } = {}) => {
  const [doctors, patients] = await Promise.all([
    User.find({ role: 'Doctor', verified: true }),
    Patient.find({}),
  ]);

  const available = doctors.filter((doctor) => {
    if (String(doctor._id) === String(excludeDoctorId)) return false;
    return !isUnavailable(doctor, appointmentDate) && !hasConflict(doctor, appointmentDate, patients);
  });

  available.sort((left, right) => {
    const leftLoad = patients.filter((patient) => String(patient.doctorAppointment?.doctorId) === String(left._id) && patient.doctorAppointment?.status === 'Pending').length;
    const rightLoad = patients.filter((patient) => String(patient.doctorAppointment?.doctorId) === String(right._id) && patient.doctorAppointment?.status === 'Pending').length;
    return leftLoad - rightLoad;
  });

  return available[0] || null;
};

export const prepareAppointment = async (patient, requestedAppointment) => {
  const appointment = { ...(patient.doctorAppointment || {}), ...(requestedAppointment || {}) };
  const currentDoctorId = appointment.doctorId;
  const currentDoctor = currentDoctorId ? await User.findById(currentDoctorId) : null;
  const needsReplacement = appointment.status === 'Cancelled' || !currentDoctor || isUnavailable(currentDoctor, appointment.appointmentDate);
  const conflict = currentDoctor && hasConflict(currentDoctor, appointment.appointmentDate, await Patient.find({ _id: { $ne: patient._id } }));

  if (needsReplacement || conflict) {
    const replacement = await findAvailableDoctor({ appointmentDate: appointment.appointmentDate, excludeDoctorId: currentDoctorId });
    if (replacement) {
      return {
        ...appointment,
        doctorId: replacement._id,
        doctorName: replacement.name,
        status: 'Reassigned',
        reassignedFrom: currentDoctor?.name || currentDoctorId || null,
        reassignedAt: new Date().toISOString(),
        appointmentTime: toDate(appointment.appointmentDate)?.toISOString() || null,
      };
    }
  }

  return {
    ...appointment,
    appointmentTime: toDate(appointment.appointmentDate)?.toISOString() || appointment.appointmentTime || null,
  };
};

export const reassignDoctorAppointments = async (doctorId) => {
  const patients = await Patient.find({});
  const affected = patients.filter((patient) => String(patient.doctorAppointment?.doctorId) === String(doctorId) && ['Pending', 'Confirmed'].includes(patient.doctorAppointment?.status));
  let reassigned = 0;

  for (const patient of affected) {
    const replacement = await findAvailableDoctor({ appointmentDate: patient.doctorAppointment.appointmentDate, excludeDoctorId: doctorId });
    if (!replacement) continue;
    patient.doctorAppointment = {
      ...patient.doctorAppointment,
      doctorId: replacement._id,
      doctorName: replacement.name,
      status: 'Reassigned',
      reassignedFrom: patient.doctorAppointment.doctorName || doctorId,
      reassignedAt: new Date().toISOString(),
      appointmentTime: toDate(patient.doctorAppointment.appointmentDate)?.toISOString() || null,
    };
    await patient.save();
    reassigned += 1;
  }

  return reassigned;
};
