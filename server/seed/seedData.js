// server/seed/seedData.js
import dotenv from 'dotenv';
import User from '../models/userModel.js'; // adjust path if different
import connectDB from '../database/dbConnection.js';
import Patient from '../models/PatientModel.js';
import LabRecord from '../models/labRecordModel.js';
import XrayRecord from '../models/xrayRecordModel.js';
import WalkInXray from '../models/walkinXrayModel.js';
import Medicine from '../models/medicineModal.js';

dotenv.config();

const DEMO_PASSWORD = 'Demo@12345';
const sampleUsers = [
  { name: 'Demo Administrator', email: 'admin@medschedule.demo', password: DEMO_PASSWORD, role: 'Admin', uniqueId: 'admin-demo-id', verified: true },
  { name: 'Demo Receptionist', email: 'reception@medschedule.demo', password: DEMO_PASSWORD, role: 'Reception', uniqueId: 'reception-demo-id', verified: true },
  { name: 'Dr. Maya Patel', email: 'doctor@medschedule.demo', password: DEMO_PASSWORD, role: 'Doctor', uniqueId: 'doctor-demo-id', verified: true, SpecialistDoctor: 'Cardiology', licenseNumber: 'MED-DEMO-001', ConsultationTimePerPatient: '30', AppointmentStart: '09:00' },
  { name: 'Dr. Jordan Lee', email: 'doctor.jordan@medschedule.demo', password: DEMO_PASSWORD, role: 'Doctor', uniqueId: 'doctor-demo-002', verified: true, SpecialistDoctor: 'General Medicine', licenseNumber: 'MED-DEMO-002', ConsultationTimePerPatient: '30', AppointmentStart: '09:00' },
  { name: 'Dr. Sara Khan', email: 'doctor.sara@medschedule.demo', password: DEMO_PASSWORD, role: 'Doctor', uniqueId: 'doctor-demo-003', verified: true, SpecialistDoctor: 'Radiology', licenseNumber: 'MED-DEMO-003', ConsultationTimePerPatient: '30', AppointmentStart: '10:00' },
  { name: 'Demo Lab Technician', email: 'lab@medschedule.demo', password: DEMO_PASSWORD, role: 'Lab', uniqueId: 'lab-demo-id', verified: true },
  { name: 'Demo X-Ray Technician', email: 'xray@medschedule.demo', password: DEMO_PASSWORD, role: 'X-Ray', uniqueId: 'xray-demo-id', verified: true },
  { name: 'Demo Pharmacist', email: 'pharmacy@medschedule.demo', password: DEMO_PASSWORD, role: 'Pharmacy', uniqueId: 'pharmacy-demo-id', verified: true },
  { name: 'Aarav Sharma', email: 'patient@medschedule.demo', password: DEMO_PASSWORD, role: 'Patient', uniqueId: 'patient-demo-id', verified: true },
];

const openSourceXrayImages = [
  'https://commons.wikimedia.org/wiki/Special:FilePath/Chest%20X-ray%20PA%203-8-2010.png',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Chest%20X-ray.jpg',
];

async function seed() {
  try {
    await connectDB();
    console.log('Connected to PostgreSQL for seeding');

    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      LabRecord.deleteMany({}),
      XrayRecord.deleteMany({}),
      WalkInXray.deleteMany({}),
      Medicine.deleteMany({}),
    ]);
    console.log('Cleared existing demo collections');

    // Do NOT pre-hash here — the model's pre('save') hook hashes it automatically
    for (const u of sampleUsers) {
      await User.create(u);
    }

    const doctor = await User.findOne({ email: 'doctor@medschedule.demo' });
    const patient = await Patient.create({
      name: 'Aarav Sharma',
      uniqueID: 'patient-demo-id',
      address: '42 Lake View Road',
      age: 34,
      weight: 72,
      gender: 'Male',
      phone: '+1 555 010 2040',
      bloodGroup: 'O+',
      doctorAppointment: {
        doctorId: doctor._id,
        doctorName: doctor.name,
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'Confirmed',
        charges: 80,
        notes: 'Follow-up consultation',
      },
      prescriptions: [{
        doctorId: doctor._id,
        doctorName: doctor.name,
        status: 'Completed',
        medicines: [{ medicineName: 'Amoxicillin', quantity: 14, dosage: '500mg', frequency: 'Twice daily', duration: '7 days' }],
        charges: 35,
        notes: 'Take after meals',
      }],
      recommendedTests: [{
        category: 'Routine checkup',
        tests: [
          { testName: 'Complete Blood Count', category: 'Hematology', status: 'Completed', result: 'Within expected range', parameters: [{ parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '13-17' }] },
          { testName: 'Chest X-Ray', category: 'Radiology', xRay: true, status: 'Completed', result: 'No acute findings' },
        ],
      }],
    });

    const additionalPatients = await Promise.all([
      Patient.create({
        name: 'Maya Johnson', uniqueID: 'patient-demo-002', address: '18 River Street', age: 29, weight: 64, gender: 'Female', phone: '+1 555 010 2041', bloodGroup: 'A+',
        doctorAppointment: { doctorId: doctor._id, doctorName: doctor.name, appointmentDate: new Date(Date.now() + 172800000).toISOString(), status: 'Pending', charges: 80 },
        prescriptions: [{ doctorId: doctor._id, doctorName: doctor.name, status: 'Pending', medicines: [{ medicineName: 'Paracetamol', quantity: 10, dosage: '500mg', frequency: 'As needed', duration: '5 days' }] }],
      }),
      Patient.create({
        name: 'Noah Williams', uniqueID: 'patient-demo-003', address: '7 Oak Avenue', age: 52, weight: 81, gender: 'Male', phone: '+1 555 010 2042', bloodGroup: 'B+',
        doctorAppointment: { doctorId: doctor._id, doctorName: doctor.name, appointmentDate: new Date(Date.now() - 86400000).toISOString(), status: 'Completed', charges: 80 },
        prescriptions: [{ doctorId: doctor._id, doctorName: doctor.name, status: 'Completed', medicines: [{ medicineName: 'Lisinopril', quantity: 30, dosage: '10mg', frequency: 'Once daily', duration: '30 days' }] }],
      }),
      Patient.create({
        name: 'Sofia Martinez', uniqueID: 'patient-demo-004', address: '91 Pine Road', age: 41, weight: 68, gender: 'Female', phone: '+1 555 010 2043', bloodGroup: 'AB+',
        doctorAppointment: { doctorId: doctor._id, doctorName: doctor.name, appointmentDate: new Date(Date.now() + 259200000).toISOString(), status: 'Pending', charges: 80 },
      }),
      Patient.create({
        name: 'Liam Brown', uniqueID: 'patient-demo-005', address: '3 Market Lane', age: 67, weight: 88, gender: 'Male', phone: '+1 555 010 2044', bloodGroup: 'O-',
        doctorAppointment: { doctorId: doctor._id, doctorName: doctor.name, appointmentDate: new Date(Date.now() - 259200000).toISOString(), status: 'Completed', charges: 80 },
        prescriptions: [{ doctorId: doctor._id, doctorName: doctor.name, status: 'Completed', medicines: [{ medicineName: 'Metformin', quantity: 60, dosage: '500mg', frequency: 'Twice daily', duration: '30 days' }] }],
      }),
    ]);
    const demoPatients = [patient, ...additionalPatients];

    await LabRecord.create({
      patientId: patient._id,
      patientName: patient.name,
      patientUniqueId: patient.uniqueID,
      age: patient.age,
      gender: patient.gender,
      doctorId: doctor._id,
      doctorName: doctor.name,
      testName: 'Complete Blood Count',
      category: 'Hematology',
      diagnosis: 'Routine screening',
      parameters: [{ parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '13-17' }, { parameter: 'WBC', value: '6.8', unit: '10^9/L', normalRange: '4-11' }],
      result: 'Within expected range',
      performedBy: 'Demo Lab Technician',
      status: 'Completed',
      priority: 'Routine',
    });

    await Promise.all(additionalPatients.slice(0, 3).map((demoPatient, index) => LabRecord.create({
      patientId: demoPatient._id,
      patientName: demoPatient.name,
      patientUniqueId: demoPatient.uniqueID,
      age: demoPatient.age,
      gender: demoPatient.gender,
      doctorId: doctor._id,
      doctorName: doctor.name,
      testName: ['Lipid Profile', 'Blood Glucose', 'Liver Function Test'][index],
      category: 'Pathology',
      diagnosis: index === 1 ? 'Diabetes screening' : 'Routine screening',
      parameters: [{ parameter: index === 1 ? 'Glucose' : 'Result', value: index === 1 ? '102' : 'Normal', unit: index === 1 ? 'mg/dL' : '', normalRange: index === 1 ? '70-110' : 'Expected range' }],
      result: index === 1 ? 'Within expected range' : 'Completed for review',
      performedBy: 'Demo Lab Technician',
      status: index === 2 ? 'Pending' : 'Completed',
      priority: index === 0 ? 'Urgent' : 'Routine',
    })));

    await XrayRecord.create({
      patientId: patient._id,
      patientName: patient.name,
      patientUniqueId: patient.uniqueID,
      age: patient.age,
      gender: patient.gender,
      doctorId: doctor._id,
      doctorName: doctor.name,
      testName: 'Chest X-Ray',
      category: 'Radiology',
      diagnosis: 'Routine chest examination',
      overallNotes: 'Open-license sample image for demonstration only.',
      records: openSourceXrayImages.map((image, index) => ({ image, cloudinary_id: `demo-xray-${index + 1}`, note: 'Demo image', filename: `demo-chest-xray-${index + 1}.jpg` })),
      performedBy: 'Demo X-Ray Technician',
      status: 'Completed',
      priority: 'Routine',
    });

    await Promise.all(demoPatients.slice(1).map((demoPatient, index) => XrayRecord.create({
      patientId: demoPatient._id,
      patientName: demoPatient.name,
      patientUniqueId: demoPatient.uniqueID,
      age: demoPatient.age,
      gender: demoPatient.gender,
      doctorId: doctor._id,
      doctorName: doctor.name,
      testName: ['Knee X-Ray', 'Chest X-Ray', 'Hand X-Ray', 'Spine X-Ray'][index],
      category: 'Radiology',
      diagnosis: 'Demonstration imaging record',
      overallNotes: 'Open-license sample image for demonstration only.',
      records: [{ image: openSourceXrayImages[index % openSourceXrayImages.length], cloudinary_id: `demo-xray-${index + 3}`, note: 'Demo image', filename: `demo-xray-${index + 3}.jpg` }],
      performedBy: 'Demo X-Ray Technician',
      status: index === 2 ? 'Pending' : 'Completed',
      priority: index === 0 ? 'Urgent' : 'Routine',
    })));

    await WalkInXray.create({
      patientName: 'Walk-in Demo Patient',
      patientUniqueId: 'walkin-demo-id',
      age: 41,
      gender: 'Female',
      phone: '+1 555 010 2055',
      testName: 'Chest X-Ray',
      category: 'Radiology',
      priority: 'routine',
      performedBy: 'Demo X-Ray Technician',
      status: 'Completed',
      images: [{ image: openSourceXrayImages[0], cloudinary_id: 'demo-walkin-xray-1', note: 'Open-license demo image', filename: 'walkin-demo-xray.jpg' }],
    });

    await Medicine.create({
      PharmacyPerson: 'Demo Pharmacist',
      charges: 24.5,
      patientName: patient.name,
      patientPhone: patient.phone,
      medicines: [{ medicineName: 'Amoxicillin', quantity: 14, dosage: '500mg', frequency: 'Twice daily', duration: '7 days', notes: 'Take after meals' }],
    });

    await Promise.all([
      { patient: additionalPatients[0], medicineName: 'Paracetamol', quantity: 10, charges: 12.5 },
      { patient: additionalPatients[1], medicineName: 'Lisinopril', quantity: 30, charges: 38.75 },
    ].map(({ patient: demoPatient, medicineName, quantity, charges }) => Medicine.create({
      PharmacyPerson: 'Demo Pharmacist', charges, patientName: demoPatient.name, patientPhone: demoPatient.phone,
      medicines: [{ medicineName, quantity, dosage: 'As prescribed', frequency: 'Daily', duration: '30 days' }],
    })));

    console.log('\nSample login credentials:');
    sampleUsers.forEach(u => console.log(`  ${u.role}: ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();