import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Calendar, Droplets, Scale, UserPlus, User as UserIcon, Stethoscope, DollarSign, Clock, Wallet } from 'lucide-react';
import patientStore from '../store/patientStore';
import userStore from '../store/userStore';

function CreatePatientModal({ onClose, onSuccess }) {
  const { createPatient, loading, patients: allPatients } = patientStore();
  const { getAllUsers, allUsers } = userStore();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    age: '',
    weight: '',
    gender: '',
    phone: '',
    bloodGroup: '',
    doctorId: '', 
    doctorName: '',
    charges: 0 ,
    appointmentNumber:'',
  });
  const [errors, setErrors] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorStats, setDoctorStats] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      await getAllUsers();
      // Filter doctors from allUsers
      const doctorList = allUsers.filter(user => 
        user.role === 'Doctor' && user.SpecialistDoctor && user.SpecialistDoctor !== 'None'
      );
      
      setDoctors(doctorList);
      
      const stats = doctorList.map(doctor => {
        const todayAppointments = allPatients.filter(patient => {
          if (patient.doctorAppointment && patient.doctorAppointment.doctorId === doctor._id) {
            const appointmentDate = new Date(patient.doctorAppointment.appointmentDate);
            const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
            return appointmentDateStr === today;
          }
          return false;
        });

        const totalAppointmentsLimit = doctor.TotalAppointments ? parseInt(doctor.TotalAppointments) : 0;
        const isAvailable = totalAppointmentsLimit === 0 || todayAppointments.length < totalAppointmentsLimit;
     
        return {
          ...doctor,
          todayAppointments: todayAppointments.length,
          isAvailable,
          remainingSlots: totalAppointmentsLimit > 0 ? totalAppointmentsLimit - todayAppointments.length : '∞'
        };
      });
      
      setDoctorStats(stats);
    };
    
    fetchData();
  }, [allUsers.length, allPatients.length]);


const calculateAppointmentNumber = (doctorId) => {
  if (!doctorId) return 1;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's appointments for selected doctor
  const doctorTodayAppointments = allPatients.filter(patient => {
    if (patient.doctorAppointment && patient.doctorAppointment.doctorId === doctorId) {
      const appointmentDate = new Date(patient.doctorAppointment.appointmentDate);
      const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
      return appointmentDateStr === today;
    }
    return false;
  });
  
  // Sort by appointmentDate to get proper sequence
  const sortedAppointments = doctorTodayAppointments.sort((a, b) => {
    const dateA = new Date(a.doctorAppointment.appointmentDate);
    const dateB = new Date(b.doctorAppointment.appointmentDate);
    return dateA - dateB;
  });
  
  // Find the next available appointment number
  const usedNumbers = sortedAppointments.map(p => p.doctorAppointment.appointmentNumber || 0);
  const maxNumber = Math.max(0, ...usedNumbers);
  return maxNumber + 1;
};

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (formData.age && (formData.age < 0 || formData.age > 150)) {
      newErrors.age = 'Enter a valid age (0-150)';
    }
    if (!formData.weight) newErrors.weight = 'Weight is required';
    if (formData.weight && (formData.weight < 0 || formData.weight > 300)) {
      newErrors.weight = 'Enter a valid weight (0-300 kg)';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid phone number (10-15 digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  // Check if selected doctor is available
  if (formData.doctorId && selectedDoctor) {
    const doctorStat = doctorStats.find(d => d._id === formData.doctorId);
    if (doctorStat && !doctorStat.isAvailable) {
      alert(`Dr. ${selectedDoctor.name} has reached the daily appointment limit (${doctorStat.TotalAppointments}). Please select another doctor.`);
      return;
    }
  }
  
  const patientData = {
    name: formData.name,
    address: formData.address,
    age: Number(formData.age),
    weight: Number(formData.weight),
    gender: formData.gender,
    phone: formData.phone || '',
    bloodGroup: formData.bloodGroup || '',
    doctorAppointment: formData.doctorId ? {
      doctorId: formData.doctorId, 
      doctorName: formData.doctorName,
      charges: Number(formData.charges),
      appointmentNumber: formData.appointmentNumber, // Auto-calculated appointment number
      appointmentDate: new Date(),
      status: "Pending",
      licenseNumber: formData.licenseNumber,
      
    } : null
  };
  
  const success = await createPatient(patientData);
  if (success) {
    onSuccess();
  }
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'age' || name === 'weight') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Handle doctor selection
 if (name === 'doctorId') {
  const doctor = doctors.find(d => d._id === value);
  if (doctor) {
    // Calculate appointment number for this doctor
    const appointmentNumber = calculateAppointmentNumber(value);
    
    setSelectedDoctor(doctor);
    setFormData(prev => ({
      ...prev,
      doctorId: value,
      doctorName: doctor.name,
      licenseNumber: doctor.licenseNumber,
      charges: doctor.ConsultationCharges ? Number(doctor.ConsultationCharges) : 0,
      appointmentNumber: appointmentNumber
    }));
  }
}
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
  const genders = ['Male', 'Female', 'Other'];

  const doctorsBySpecialization = doctorStats.reduce((acc, doctor) => {
    const spec = doctor.SpecialistDoctor || 'General';
    if (!acc[spec]) {
      acc[spec] = [];
    }
    acc[spec].push(doctor);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Register New Patient</h2>
                <p className="text-sm text-gray-600">Fill in the required patient details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Required Information */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Required Information *
              </h3>
              
              <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-4">
                {/* Name - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-black border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      placeholder="Enter patient's full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Age - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (Years) *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      placeholder="Enter age in years"
                    />
                  </div>
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                  )}
                </div>

                {/* Weight - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.weight ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      placeholder="Enter weight in kg"
                    />
                  </div>
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                  )}
                </div>

                {/* Gender - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  >
                    <option value="">Select Gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Address Information *
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full pl-10 pr-4 py-2.5 text-black border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                    placeholder="Enter complete address including street, city, state, and postal code"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Doctor Appointment Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-amber-600" />
                Doctor Appointment (Optional)
              </h3>
              
              <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-4">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Select a Doctor (Optional)</option>
                      {Object.entries(doctorsBySpecialization).map(([specialization, docs]) => (
                        <optgroup key={specialization} label={specialization}>
                          {docs.map(doctor => (
                            <option 
                              key={doctor._id} 
                              value={doctor._id}
                              disabled={!doctor.isAvailable}
                              className={!doctor.isAvailable ? 'text-gray-400' : ''}
                            >
                              Dr. {doctor.name} - PKR {doctor.ConsultationCharges || 0}
                              {doctor.isAvailable 
                                ? doctor.TotalAppointments 
                                  ? ` (Slots: ${doctor.remainingSlots}/${doctor.TotalAppointments})`
                                  : ' (Available)'
                                : ' (FULL - No Slots Available)'}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Appointment is optional. You can assign a doctor later.
                  </p>
                </div>

                {/* Charges Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Charges
                  </label>
                  <div className="relative">
                    <Wallet arSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={selectedDoctor ? `PKR ${formData.charges}` : 'No PKR selected'}
                      readOnly
                      className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg ${
                        selectedDoctor ? 'bg-gray-50 text-gray-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Details Card */}
              {/* {selectedDoctor && (
                <div className="mt-4 p-3 text-black bg-white rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Selected Doctor Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium ml-2">Dr. {selectedDoctor.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Specialization:</span>
                      <span className="font-medium ml-2">{selectedDoctor.SpecialistDoctor}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium ml-2">{selectedDoctor.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Timing:</span>
                      <span className="font-medium ml-2">{selectedDoctor.ConsultationTime || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Charges:</span>
                      <span className="font-medium ml-2">PKR {selectedDoctor.ConsultationCharges}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time/Patient:</span>
                      <span className="font-medium ml-2">{selectedDoctor.ConsultationTimePerPatient || 'N/A'} mins</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Today's Appointments:</span>
                      <span className={`font-medium ml-2 ${
                        doctorStats.find(d => d._id === selectedDoctor._id)?.isAvailable 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {doctorStats.find(d => d._id === selectedDoctor._id)?.todayAppointments || 0}
                        {selectedDoctor.TotalAppointments ? ` / ${selectedDoctor.TotalAppointments}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )} */}
{/* Doctor Details Card */}
{selectedDoctor && (
  <div className="mt-4 p-3 text-black bg-white rounded-lg border border-gray-200">
    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
      <Stethoscope className="w-4 h-4" />
      Selected Doctor Details
    </h4>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <span className="text-gray-600">Name:</span>
        <span className="font-medium ml-2">Dr. {selectedDoctor.name}</span>
      </div>
      <div>
        <span className="text-gray-600">Specialization:</span>
        <span className="font-medium ml-2">{selectedDoctor.SpecialistDoctor}</span>
      </div>
      <div>
        <span className="text-gray-600">licenseNumber:</span>
        <span className="font-mono ml-2">{selectedDoctor.licenseNumber}</span>
      </div>
      <div>
        <span className="text-gray-600">Phone:</span>
        <span className="font-medium ml-2">{selectedDoctor.phone || 'N/A'}</span>
      </div>
      <div>
        <span className="text-gray-600">Timing:</span>
        <span className="font-medium ml-2">{selectedDoctor.ConsultationTime || 'N/A'}</span>
      </div>
      <div>
        <span className="text-gray-600">Charges:</span>
        <span className="font-medium ml-2">PKR {selectedDoctor.ConsultationCharges}</span>
      </div>
      <div>
        <span className="text-gray-600">Time/Patient:</span>
        <span className="font-medium ml-2">{selectedDoctor.ConsultationTimePerPatient || 'N/A'} mins</span>
      </div>
      <div className="col-span-2">
        <span className="text-gray-600">Today's Appointments:</span>
        <span className={`font-medium ml-2 ${
          doctorStats.find(d => d._id === selectedDoctor._id)?.isAvailable 
            ? 'text-green-600' 
            : 'text-red-600'
        }`}>
          {doctorStats.find(d => d._id === selectedDoctor._id)?.todayAppointments || 0}
          {selectedDoctor.TotalAppointments ? ` / ${selectedDoctor.TotalAppointments}` : ''}
        </span>
      </div>
      {/* NEW: Appointment Number Info */}
      <div className="col-span-2">
        <span className="text-gray-600">Your Appointment Number:</span>
        <span className="font-medium ml-2 text-blue-600">
          {formData.appointmentNumber || 'Not assigned yet'}
        </span>
        <p className="text-xs text-gray-500 mt-1">
          This is your sequence number for today's appointments with this doctor
        </p>
      </div>
    </div>
  </div>
)}
              {/* Today's Appointment Stats */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Today's Appointment Statistics ({today})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {doctorStats.slice(0, 4).map(doctor => (
                    <div 
                      key={doctor._id} 
                      className={`p-2 rounded-lg text-xs ${
                        doctor.isAvailable 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="font-medium truncate">Dr. {doctor.name.split(' ')[0]}</div>
                      <div className={`text-sm font-semibold ${
                        doctor.isAvailable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {doctor.todayAppointments}/{doctor.TotalAppointments || '∞'}
                      </div>
                      <div className="text-xs text-gray-500">{doctor.SpecialistDoctor}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-green-600" />
                Additional Information
              </h3>
              
              <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Summary:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Name: {formData.name || 'Not provided'}</li>
                <li>• Age: {formData.age || 'Not provided'} years</li>
                <li>• Weight: {formData.weight || 'Not provided'} kg</li>
                <li>• Gender: {formData.gender || 'Not selected'}</li>
                <li>• Address: {formData.address ? (formData.address.length > 50 ? formData.address.substring(0, 50) + '...' : formData.address) : 'Not provided'}</li>
                <li>• Phone: {formData.phone || 'Not provided'}</li>
                <li>• Blood Group: {formData.bloodGroup || 'Not specified'}</li>
                <li>• Doctor: {selectedDoctor ? `Dr. ${selectedDoctor.name}` : 'Not selected'}</li>
                <li>• Charges: {selectedDoctor ? `PKR ${formData.charges}` : 'N/A'}</li>
                <li>• Appointment Number: {selectedDoctor ? `#${formData.appointmentNumber || 'Calculating...'}` : 'N/A'}</li>
                <li>• Status: {selectedDoctor ? 'Pending Appointment' : 'No Appointment'}</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6 -mx-6 -mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Patient...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    {selectedDoctor ? 'Create with Appointment' : 'Create Patient'}
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              * Required fields: Name, Address, Age, Weight, Gender
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePatientModal;







// import React, { useState, useEffect } from 'react';
// import { X, User, Phone, MapPin, Calendar, Droplets, Scale, UserPlus, User as UserIcon, Stethoscope, DollarSign, Clock, Wallet } from 'lucide-react';
// import patientStore from '../store/patientStore';
// import userStore from '../store/userStore';

// function CreatePatientModal({ onClose, onSuccess }) {
//   const { createPatient, loading, patients: allPatients } = patientStore();
//   const { getAllUsers, allUsers } = userStore();
//   const [formData, setFormData] = useState({
//     name: '',
//     address: '',
//     age: '',
//     weight: '',
//     gender: '',
//     phone: '',
//     bloodGroup: '',
//     doctorId: '', 
//     doctorName: '',
//     charges: 0 
//   });
//   const [errors, setErrors] = useState({});
//   const [doctors, setDoctors] = useState([]);
//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [doctorStats, setDoctorStats] = useState([]);

//   const today = new Date().toISOString().split('T')[0];

//   useEffect(() => {
//     const fetchData = async () => {
//       await getAllUsers();
//       // Filter doctors from allUsers
//       const doctorList = allUsers.filter(user => 
//         user.role === 'Doctor' && user.SpecialistDoctor && user.SpecialistDoctor !== 'None'
//       );
      
//       setDoctors(doctorList);
      
//       const stats = doctorList.map(doctor => {
//         const todayAppointments = allPatients.filter(patient => {
//           if (patient.doctorAppointment && patient.doctorAppointment.doctorId === doctor._id) {
//             const appointmentDate = new Date(patient.doctorAppointment.appointmentDate);
//             const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
//             return appointmentDateStr === today;
//           }
//           return false;
//         });
        
//         const totalAppointmentsLimit = doctor.TotalAppointments ? parseInt(doctor.TotalAppointments) : 0;
//         const isAvailable = totalAppointmentsLimit === 0 || todayAppointments.length < totalAppointmentsLimit;
     
//         return {
//           ...doctor,
//           todayAppointments: todayAppointments.length,
//           isAvailable,
//           remainingSlots: totalAppointmentsLimit > 0 ? totalAppointmentsLimit - todayAppointments.length : '∞'
//         };
//       });
      
//       setDoctorStats(stats);
//     };
    
//     fetchData();
//   }, [allUsers.length, allPatients.length]);

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) newErrors.name = 'Name is required';
//     if (!formData.address.trim()) newErrors.address = 'Address is required';
//     if (!formData.age) newErrors.age = 'Age is required';
//     if (formData.age && (formData.age < 0 || formData.age > 150)) {
//       newErrors.age = 'Enter a valid age (0-150)';
//     }
//     if (!formData.weight) newErrors.weight = 'Weight is required';
//     if (formData.weight && (formData.weight < 0 || formData.weight > 300)) {
//       newErrors.weight = 'Enter a valid weight (0-300 kg)';
//     }
//     if (!formData.gender) newErrors.gender = 'Gender is required';
//     if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
//       newErrors.phone = 'Enter a valid phone number (10-15 digits)';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
    
//     // Check if selected doctor is available
//     if (formData.doctorId && selectedDoctor) {
//       const doctorStat = doctorStats.find(d => d._id === formData.doctorId);
//       if (doctorStat && !doctorStat.isAvailable) {
//         alert(`Dr. ${selectedDoctor.name} has reached the daily appointment limit (${doctorStat.TotalAppointments}). Please select another doctor.`);
//         return;
//       }
//     }
    
//     const patientData = {
//       name: formData.name,
//       address: formData.address,
//       age: Number(formData.age),
//       weight: Number(formData.weight),
//       gender: formData.gender,
//       phone: formData.phone || '',
//       bloodGroup: formData.bloodGroup || '',
//       doctorAppointment: formData.doctorId ? {
//         doctorId: formData.doctorId, 
//         doctorName: formData.doctorName,
//         charges: Number(formData.charges),
//         appointmentDate: new Date(),
//         status: "Pending"
//       } : null
//     };
    
//     const success = await createPatient(patientData);
//     if (success) {
//       onSuccess();
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'age' || name === 'weight') {
//       if (value === '' || /^\d*\.?\d*$/.test(value)) {
//         setFormData(prev => ({
//           ...prev,
//           [name]: value
//         }));
//       }
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
    
//     // Handle doctor selection
//     if (name === 'doctorId') {
//       const doctor = doctors.find(d => d._id === value);
//       if (doctor) {
//         setSelectedDoctor(doctor);
//         setFormData(prev => ({
//           ...prev,
//           doctorId: value,
//           doctorName: doctor.name,
//           charges: doctor.ConsultationCharges ? Number(doctor.ConsultationCharges) : 0
//         }));
//       }
//     }
    
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
//   const genders = ['Male', 'Female', 'Other'];

//   const doctorsBySpecialization = doctorStats.reduce((acc, doctor) => {
//     const spec = doctor.SpecialistDoctor || 'General';
//     if (!acc[spec]) {
//       acc[spec] = [];
//     }
//     acc[spec].push(doctor);
//     return acc;
//   }, {});

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
//                 <UserPlus className="w-6 h-6 text-indigo-600" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">Register New Patient</h2>
//                 <p className="text-sm text-gray-600">Fill in the required patient details</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <X className="w-5 h-5 text-gray-500" />
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6">
//           <div className="space-y-6">
//             {/* Required Information */}
//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <User className="w-5 h-5 text-indigo-600" />
//                 Required Information *
//               </h3>
              
//               <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-4">
//                 {/* Name - Required */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Full Name *
//                   </label>
//                   <div className="relative">
//                     <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       className={`w-full pl-10 pr-4 py-2.5 text-black border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
//                       placeholder="Enter patient's full name"
//                     />
//                   </div>
//                   {errors.name && (
//                     <p className="mt-1 text-sm text-red-600">{errors.name}</p>
//                   )}
//                 </div>

//                 {/* Age - Required */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Age (Years) *
//                   </label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       name="age"
//                       value={formData.age}
//                       onChange={handleInputChange}
//                       className={`w-full pl-10 pr-4 py-2.5 border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
//                       placeholder="Enter age in years"
//                     />
//                   </div>
//                   {errors.age && (
//                     <p className="mt-1 text-sm text-red-600">{errors.age}</p>
//                   )}
//                 </div>

//                 {/* Weight - Required */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Weight (kg) *
//                   </label>
//                   <div className="relative">
//                     <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       name="weight"
//                       value={formData.weight}
//                       onChange={handleInputChange}
//                       className={`w-full pl-10 pr-4 py-2.5 border ${errors.weight ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
//                       placeholder="Enter weight in kg"
//                     />
//                   </div>
//                   {errors.weight && (
//                     <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
//                   )}
//                 </div>

//                 {/* Gender - Required */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Gender *
//                   </label>
//                   <select
//                     name="gender"
//                     value={formData.gender}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-2.5 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
//                   >
//                     <option value="">Select Gender</option>
//                     {genders.map(gender => (
//                       <option key={gender} value={gender}>{gender}</option>
//                     ))}
//                   </select>
//                   {errors.gender && (
//                     <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Address Section */}
//             <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <MapPin className="w-5 h-5 text-blue-600" />
//                 Address Information *
//               </h3>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Complete Address *
//                 </label>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
//                   <textarea
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     rows="3"
//                     className={`w-full pl-10 pr-4 py-2.5 text-black border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
//                     placeholder="Enter complete address including street, city, state, and postal code"
//                   />
//                 </div>
//                 {errors.address && (
//                   <p className="mt-1 text-sm text-red-600">{errors.address}</p>
//                 )}
//               </div>
//             </div>

//             {/* Doctor Appointment Section */}
//             <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Stethoscope className="w-5 h-5 text-amber-600" />
//                 Doctor Appointment (Optional)
//               </h3>
              
//               <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-4">
//                 {/* Doctor Selection */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Select Doctor
//                   </label>
//                   <div className="relative">
//                     <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <select
//                       name="doctorId"
//                       value={formData.doctorId}
//                       onChange={handleInputChange}
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                     >
//                       <option value="">Select a Doctor (Optional)</option>
//                       {Object.entries(doctorsBySpecialization).map(([specialization, docs]) => (
//                         <optgroup key={specialization} label={specialization}>
//                           {docs.map(doctor => (
//                             <option 
//                               key={doctor._id} 
//                               value={doctor._id}
//                               disabled={!doctor.isAvailable}
//                               className={!doctor.isAvailable ? 'text-gray-400' : ''}
//                             >
//                               Dr. {doctor.name} - PKR {doctor.ConsultationCharges || 0}
//                               {doctor.isAvailable 
//                                 ? doctor.TotalAppointments 
//                                   ? ` (Slots: ${doctor.remainingSlots}/${doctor.TotalAppointments})`
//                                   : ' (Available)'
//                                 : ' (FULL - No Slots Available)'}
//                             </option>
//                           ))}
//                         </optgroup>
//                       ))}
//                     </select>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Note: Appointment is optional. You can assign a doctor later.
//                   </p>
//                 </div>

//                 {/* Charges Display */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Consultation Charges
//                   </label>
//                   <div className="relative">
//                     <Wallet arSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       value={selectedDoctor ? `PKR ${formData.charges}` : 'No PKR selected'}
//                       readOnly
//                       className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg ${
//                         selectedDoctor ? 'bg-gray-50 text-gray-700' : 'bg-gray-100 text-gray-500'
//                       }`}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Doctor Details Card */}
//               {selectedDoctor && (
//                 <div className="mt-4 p-3 text-black bg-white rounded-lg border border-gray-200">
//                   <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
//                     <Stethoscope className="w-4 h-4" />
//                     Selected Doctor Details
//                   </h4>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <div>
//                       <span className="text-gray-600">Name:</span>
//                       <span className="font-medium ml-2">Dr. {selectedDoctor.name}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Specialization:</span>
//                       <span className="font-medium ml-2">{selectedDoctor.SpecialistDoctor}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Phone:</span>
//                       <span className="font-medium ml-2">{selectedDoctor.phone || 'N/A'}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Timing:</span>
//                       <span className="font-medium ml-2">{selectedDoctor.ConsultationTime || 'N/A'}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Charges:</span>
//                       <span className="font-medium ml-2">PKR {selectedDoctor.ConsultationCharges}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Time/Patient:</span>
//                       <span className="font-medium ml-2">{selectedDoctor.ConsultationTimePerPatient || 'N/A'} mins</span>
//                     </div>
//                     <div className="col-span-2">
//                       <span className="text-gray-600">Today's Appointments:</span>
//                       <span className={`font-medium ml-2 ${
//                         doctorStats.find(d => d._id === selectedDoctor._id)?.isAvailable 
//                           ? 'text-green-600' 
//                           : 'text-red-600'
//                       }`}>
//                         {doctorStats.find(d => d._id === selectedDoctor._id)?.todayAppointments || 0}
//                         {selectedDoctor.TotalAppointments ? ` / ${selectedDoctor.TotalAppointments}` : ''}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Today's Appointment Stats */}
//               <div className="mt-4">
//                 <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                   <Clock className="w-4 h-4" />
//                   Today's Appointment Statistics ({today})
//                 </h4>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                   {doctorStats.slice(0, 4).map(doctor => (
//                     <div 
//                       key={doctor._id} 
//                       className={`p-2 rounded-lg text-xs ${
//                         doctor.isAvailable 
//                           ? 'bg-green-50 border border-green-200' 
//                           : 'bg-red-50 border border-red-200'
//                       }`}
//                     >
//                       <div className="font-medium truncate">Dr. {doctor.name.split(' ')[0]}</div>
//                       <div className={`text-sm font-semibold ${
//                         doctor.isAvailable ? 'text-green-600' : 'text-red-600'
//                       }`}>
//                         {doctor.todayAppointments}/{doctor.TotalAppointments || '∞'}
//                       </div>
//                       <div className="text-xs text-gray-500">{doctor.SpecialistDoctor}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Additional Information */}
//             <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Droplets className="w-5 h-5 text-green-600" />
//                 Additional Information
//               </h3>
              
//               <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-4">
//                 {/* Phone */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Phone Number
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleInputChange}
//                       className={`w-full pl-10 pr-4 py-2.5 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
//                       placeholder="Enter phone number"
//                     />
//                   </div>
//                   {errors.phone && (
//                     <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
//                   )}
//                 </div>

//                 {/* Blood Group */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Blood Group
//                   </label>
//                   <div className="relative">
//                     <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <select
//                       name="bloodGroup"
//                       value={formData.bloodGroup}
//                       onChange={handleInputChange}
//                       className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                     >
//                       <option value="">Select Blood Group</option>
//                       {bloodGroups.map(group => (
//                         <option key={group} value={group}>{group}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Form Summary */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h4 className="font-medium text-gray-700 mb-2">Summary:</h4>
//               <ul className="text-sm text-gray-600 space-y-1">
//                 <li>• Name: {formData.name || 'Not provided'}</li>
//                 <li>• Age: {formData.age || 'Not provided'} years</li>
//                 <li>• Weight: {formData.weight || 'Not provided'} kg</li>
//                 <li>• Gender: {formData.gender || 'Not selected'}</li>
//                 <li>• Address: {formData.address ? (formData.address.length > 50 ? formData.address.substring(0, 50) + '...' : formData.address) : 'Not provided'}</li>
//                 <li>• Phone: {formData.phone || 'Not provided'}</li>
//                 <li>• Blood Group: {formData.bloodGroup || 'Not specified'}</li>
//                 <li>• Doctor: {selectedDoctor ? `Dr. ${selectedDoctor.name}` : 'Not selected'}</li>
//                 <li>• Charges: {selectedDoctor ? `PKR ${formData.charges}` : 'N/A'}</li>
//                 <li>• Status: {selectedDoctor ? 'Pending Appointment' : 'No Appointment'}</li>
//               </ul>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6 -mx-6 -mb-6">
//             <div className="flex flex-col sm:flex-row gap-3">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors border border-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Creating Patient...
//                   </>
//                 ) : (
//                   <>
//                     <UserPlus className="w-5 h-5" />
//                     {selectedDoctor ? 'Create with Appointment' : 'Create Patient'}
//                   </>
//                 )}
//               </button>
//             </div>
            
//             <p className="text-xs text-gray-500 mt-3 text-center">
//               * Required fields: Name, Address, Age, Weight, Gender
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CreatePatientModal;