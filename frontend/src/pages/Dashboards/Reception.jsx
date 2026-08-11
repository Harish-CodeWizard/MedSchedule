import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  Phone,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  CheckCircle,
  Download,
  User,
  X,
  Save,
  Scale,
  Droplets,
  Stethoscope
} from 'lucide-react';
import patientStore from '../../store/patientStore.js';
import CreatePatientModal from '../../components/CreatePatientModal.jsx';
import userStore from '../../store/userStore.js'

function Reception() {
  const { patients, loading, getAllPatients, updatePatient, deletePatient } = patientStore();
  const {getAllUsers,allUsers} = userStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Appointment Edit Modal State
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    charges: '',
    status: 'Pending',
    appointmentDate: '',
    appointmentNumber: 1,

  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    age: '',
    weight: '',
    gender: '',
    phone: '',
    bloodGroup: '',
    doctorAppointment: null 
  });

  const patientsPerPage = 5;

  // Fetch doctors
  const fetchDoctors = async() => {
    await getAllUsers();
  };

  useEffect(() => {
    fetchDoctors();
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    getAllPatients();
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.uniqueID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      patient.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

const today = new Date().toDateString(); 

const stats = {
  total: patients.length,
  withAppointment: patients.filter(p => 
    p.doctorAppointment &&
    p.doctorAppointment.doctorId &&
    new Date(p.doctorAppointment.appointmentDate).toDateString() === today
  ).length,

  pendingAppointments: patients.filter(p => 
    p.doctorAppointment &&
    p.doctorAppointment.status === 'Pending' &&
    new Date(p.doctorAppointment.appointmentDate).toDateString() === today
  ).length,

  newToday: patients.filter(p => 
    new Date(p.createdAt).toDateString() === today
  ).length
};


  const handlePatientCreated = () => {
    getAllPatients();
    setShowCreateModal(false);
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };


const handleAppointmentEditClick = (patient) => {
  setSelectedPatient(patient);
  
  if (patient.doctorAppointment) {
    const existingDoctorId = patient.doctorAppointment.doctorId || '';
    const existingDoctor = getDoctors().find(d => d._id === existingDoctorId);
    
    setAppointmentForm({
      doctorId: existingDoctorId,
      charges: patient.doctorAppointment.charges || (existingDoctor?.ConsultationCharges || 0),
      status: patient.doctorAppointment.status || 'Pending',
      appointmentDate: patient.doctorAppointment.appointmentDate 
        ? new Date(patient.doctorAppointment.appointmentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
  } else {
    setAppointmentForm({
      doctorId: '',
      charges: '',
      status: 'Pending',
      appointmentDate: new Date().toISOString().split('T')[0],
    });
  }
  
  setShowAppointmentModal(true);
};

// Function to calculate appointment number for edit modal
const calculateAppointmentNumberForEdit = (doctorId, appointmentDate, currentPatientId) => {
  if (!doctorId) return 1;
  
  const date = new Date(appointmentDate);
  const dateStr = date.toISOString().split('T')[0];
  
  // Get appointments for this doctor on selected date
  const doctorAppointmentsOnDate = patients.filter(patient => {
    if (patient.doctorAppointment && patient.doctorAppointment.doctorId === doctorId) {
      const patientAppointmentDate = new Date(patient.doctorAppointment.appointmentDate);
      const patientDateStr = patientAppointmentDate.toISOString().split('T')[0];
      return patientDateStr === dateStr && patient._id !== currentPatientId;
    }
    return false;
  });
  
  // Sort by appointment date and appointment number
  const sortedAppointments = doctorAppointmentsOnDate.sort((a, b) => {
    const numA = a.doctorAppointment.appointmentNumber || 0;
    const numB = b.doctorAppointment.appointmentNumber || 0;
    return numA - numB;
  });
  
  // Find the next available appointment number
  const usedNumbers = sortedAppointments.map(p => p.doctorAppointment.appointmentNumber || 0);
  const maxNumber = Math.max(0, ...usedNumbers);
  return maxNumber + 1;
};
 
const handleAppointmentSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedPatient) return;
  
  // Check if selected doctor is available
  const selectedDoctorData = getDoctors().find(d => d._id === appointmentForm.doctorId);
  if (selectedDoctorData) {
    if (!selectedDoctorData.isAvailable) {
      alert(`Dr. ${selectedDoctorData.name} has reached the daily appointment limit (${selectedDoctorData.TotalAppointments}). Please select another doctor.`);
      return;
    }
  }
  
  const updatedData = {
    doctorAppointment: {
      doctorId: appointmentForm.doctorId,
      charges: Number(appointmentForm.charges) || 0,
      status: appointmentForm.status,
      appointmentDate: new Date(appointmentForm.appointmentDate),
      doctorName: getDoctorName(appointmentForm.doctorId),
      appointmentNumber: appointmentForm.appointmentNumber || 1 // Include appointment number
    }
  };
  
  const success = await updatePatient(selectedPatient._id, updatedData);
  if (success) {
    setShowAppointmentModal(false);
    setSelectedPatient(null);
    getAllPatients();
  }
};


const handleAppointmentInputChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'doctorId') {
    const doctor = getDoctors().find(d => d._id === value);
    
    if (doctor) {
      const doctorCharges = doctor.ConsultationCharges || doctor.charges || 0;
      const appointmentNumber = calculateAppointmentNumberForEdit(
        value, 
        appointmentForm.appointmentDate || new Date().toISOString().split('T')[0],
        selectedPatient?._id
      );
      
      setAppointmentForm(prev => ({
        ...prev,
        doctorId: value,
        charges: doctorCharges,
        appointmentNumber: appointmentNumber // Auto-calculated appointment number
      }));
    } else {
      setAppointmentForm(prev => ({
        ...prev,
        doctorId: value,
        charges: '',
        appointmentNumber: 1
      }));
    }
  } else if (name === 'appointmentDate') {
    // When date changes, recalculate appointment number if doctor is selected
    let newAppointmentNumber = 1;
    
    if (appointmentForm.doctorId) {
      newAppointmentNumber = calculateAppointmentNumberForEdit(
        appointmentForm.doctorId,
        value,
        selectedPatient?._id
      );
    }
    
    setAppointmentForm(prev => ({
      ...prev,
      [name]: value,
      appointmentNumber: newAppointmentNumber
    }));
  } else {
    setAppointmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

  const handleRemoveAppointment = async () => {
    if (!selectedPatient || !selectedPatient.doctorAppointment) return;
    
    const updatedData = {
      doctorAppointment: null
    };
    
    const success = await updatePatient(selectedPatient._id, updatedData);
    if (success) {
      setShowAppointmentModal(false);
      setSelectedPatient(null);
      getAllPatients();
    }
  };

  // Edit Functions
  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      name: patient.name || '',
      address: patient.address || '',
      age: patient.age || '',
      weight: patient.weight || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      bloodGroup: patient.bloodGroup || '',
      doctorAppointment: patient.doctorAppointment || null 
    });
    setShowEditModal(true);
    setShowPatientDetails(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const updatedData = {
      ...editFormData,
      age: Number(editFormData.age),
      weight: Number(editFormData.weight),
      // Doctor appointment ko as is rakhna hai agar exists hai
      doctorAppointment: editFormData.doctorAppointment || undefined
    };
    
    const success = await updatePatient(selectedPatient._id, updatedData);
    if (success) {
      setShowEditModal(false);
      setSelectedPatient(null);
      getAllPatients();
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'age' || name === 'weight') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setEditFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Delete Functions
  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      const success = await deletePatient(patientToDelete._id);
      if (success) {
        setShowDeleteConfirm(false);
        setPatientToDelete(null);
        getAllPatients();
      }
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
  const genders = ['Male', 'Female', 'Other'];
  const appointmentStatuses = ["Pending", "Completed", "Cancelled"];

  // Get doctor name from ID
  const getDoctorName = (doctorId) => {
    if (!doctorId) return 'Not assigned';
    const doctor = allUsers.find(user => user._id === doctorId);
    return doctor ? `Dr. ${doctor.name}` : 'Unknown Doctor';
  };

const getDoctors = () => {
  const today = new Date().toISOString().split('T')[0];
  
  return allUsers.filter(user => 
    (user.role === 'doctor' || user.role === 'Doctor') && 
    user.SpecialistDoctor && 
    user.SpecialistDoctor !== 'None'
  ).map(doctor => {
    // Calculate today's appointments for this doctor
    const todayAppointments = patients.filter(patient => {
      if (patient.doctorAppointment && patient.doctorAppointment.doctorId === doctor._id) {
        const appointmentDate = new Date(patient.doctorAppointment.appointmentDate);
        const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
        return appointmentDateStr === today;
      }
      return false;
    });
    
    // Check if doctor has reached daily limit
    const totalAppointmentsLimit = doctor.TotalAppointments ? parseInt(doctor.TotalAppointments) : 0;
    const isAvailable = totalAppointmentsLimit === 0 || todayAppointments.length < totalAppointmentsLimit;
    const remainingSlots = totalAppointmentsLimit > 0 ? totalAppointmentsLimit - todayAppointments.length : '∞';
    
    return {
      ...doctor,
      ConsultationCharges: doctor.ConsultationCharges || doctor.charges || 0,
      todayAppointments: todayAppointments.length,
      isAvailable,
      remainingSlots
    };
  });
};



const handlePrintDetails = () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    
    // Helper function to safely get values
    const safeGet = (value, defaultValue = 'Not specified') => {
      return value || defaultValue;
    };
    
    // Get appointment details safely
    const appointment = selectedPatient.doctorAppointment || {};
    const doctorName = safeGet(appointment.doctorName, getDoctorName(appointment.doctorId));
    const licenseNumber = selectedPatient.doctorAppointment.licenseNumber || {};
    
    const appointmentDate = appointment.appointmentDate 
      ? new Date(appointment.appointmentDate).toLocaleDateString() 
      : 'Not scheduled';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Details - ${safeGet(selectedPatient.name)}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
              color: #333;
              background: #f8f9fa;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #4f46e5; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .header h1 { 
              color: #4f46e5; 
              margin: 0; 
            }
            .patient-info { 
              margin-bottom: 30px; 
              background: white; 
              padding: 25px; 
              border-radius: 12px; 
              border: 1px solid #e2e8f0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .section-title {
              color: #4f46e5;
              border-bottom: 2px solid #c7d2fe;
              padding-bottom: 8px;
              margin-top: 25px;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dashed #e2e8f0;
            }
            .info-label {
              font-weight: 600;
              color: #64748b;
            }
            .info-value {
              font-weight: 500;
              color: #1e293b;
            }
            .appointment-section {
              background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
              padding: 25px;
              border-radius: 12px;
              border: 1px solid #fed7aa;
              margin: 25px 0;
              box-shadow: 0 2px 10px rgba(251, 146, 60, 0.1);
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              margin-left: 10px;
            }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .footer { 
              margin-top: 50px; 
              border-top: 2px solid #4f46e5; 
              padding-top: 20px; 
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
            .hospital-info {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
              color: white;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
            }
            .hospital-name {
              font-size: 24px;
              font-weight: bold;
              color: white;
              margin-bottom: 5px;
            }
            .print-date {
              text-align: right;
              color: #64748b;
              font-size: 14px;
              margin-bottom: 20px;
              padding: 10px;
              background: white;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .patient-id {
              background: #e0e7ff;
              color: #4f46e5;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              display: inline-block;
              margin: 10px 0;
            }
            @media print {
              body { padding: 15px; background: white; }
              .no-print { display: none; }
              .hospital-info {
                background: #4f46e5 !important;
                -webkit-print-color-adjust: exact;
              }
              .appointment-section {
                background: #fff7ed !important;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="hospital-info">
            <div class="hospital-name">Hospital Management System</div>
            <div>Patient Medical Record</div>
            <div class="patient-id">Patient ID: ${safeGet(selectedPatient.uniqueID, selectedPatient._id?.substring(0, 8))}</div>
          </div>
          
          <div class="print-date">
            Printed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
          
          <div class="header">
            <h1>PATIENT DETAILS</h1>
          </div>
          
          <div class="patient-info">
            <h2 class="section-title">Personal Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Patient Name:</span>
                <span class="info-value">${safeGet(selectedPatient.name)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Age:</span>
                <span class="info-value">${safeGet(selectedPatient.age)} years</span>
              </div>
              <div class="info-item">
                <span class="info-label">Gender:</span>
                <span class="info-value">${safeGet(selectedPatient.gender)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Weight:</span>
                <span class="info-value">${safeGet(selectedPatient.weight, 'N/A')} kg</span>
              </div>
              <div class="info-item">
                <span class="info-label">Blood Group:</span>
                <span class="info-value">${safeGet(selectedPatient.bloodGroup)}</span>
              </div>
            </div>
            
            <h2 class="section-title">Contact Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Phone Number:</span>
                <span class="info-value">${safeGet(selectedPatient.phone)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Address:</span>
                <span class="info-value">${safeGet(selectedPatient.address)}</span>
              </div>
            </div>
            
            <h2 class="section-title">System Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Registration Date:</span>
                <span class="info-value">${selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">${selectedPatient.updatedAt ? new Date(selectedPatient.updatedAt).toLocaleDateString() : (selectedPatient.createdAt ? new Date(selectedPatient.createdAt).toLocaleDateString() : 'N/A')}</span>
              </div>
            </div>
          </div>
          
          ${appointment.doctorId ? `
            <div class="appointment-section">
              <h2 class="section-title">Appointment Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Appointment Number:</span>
                  <span class="info-value">${safeGet(appointment.appointmentNumber, 'N/A')}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Doctor:</span>
                  <span class="info-value">${doctorName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">licenseNumber:</span>
                  <span class="info-value">${licenseNumber}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Appointment Date:</span>
                  <span class="info-value">${appointmentDate}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Charges:</span>
                  <span class="info-value">PKR ${safeGet(appointment.charges, 0)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span>
                  <span class="info-value">
                    ${safeGet(appointment.status, 'Pending')}
                    <span class="status-badge status-${(appointment.status || 'Pending').toLowerCase()}">
                      ${(appointment.status || 'Pending').toUpperCase()}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ` : `
            <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 16px;">
                <strong style="color: #475569;">No Appointment Scheduled</strong><br>
                This patient does not have any scheduled appointments.
              </p>
            </div>
          `}
          
          <div class="footer">
            <p>This document is computer-generated and does not require a signature.</p>
            <p>Hospital Management System | ${new Date().getFullYear()}</p>
            <p style="font-size: 12px; margin-top: 10px;">Confidential Medical Record - For internal use only</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="
              background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 8px; 
              cursor: pointer; 
              font-size: 16px;
              font-weight: 600;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
            ">
              🖨️ Print Document
            </button>
            <p style="color: #64748b; margin-top: 10px; font-size: 14px;">Click above button to print</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };






  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reception Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Manage patient registrations and information</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-all hover:shadow-lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {isMobile ? 'New Patient' : 'Register New Patient'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Appointments</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{stats.withAppointment}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pendingAppointments}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Today</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{stats.newToday}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border text-black border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name, ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                      <p className="mt-2 text-gray-600">Loading patients...</p>
                    </td>
                  </tr>
                ) : currentPatients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No patients found</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Register your first patient
                      </button>
                    </td>
                  </tr>
                ) : (
                  currentPatients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {patient.name?.charAt(0).toUpperCase() || 'P'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {patient.uniqueID || patient._id?.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1 mb-1">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{patient.phone || 'Not provided'}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {patient.address ? (patient.address.length > 30 ? patient.address.substring(0, 30) + '...' : patient.address) : 'No address'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {patient.doctorAppointment && patient.doctorAppointment.doctorId ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {getDoctorName(patient.doctorAppointment.doctorId)}
                            </div>
                            <div className="text-xs text-gray-500">
                              PKR {patient.doctorAppointment.charges || 0}
                            </div>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              patient.doctorAppointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              patient.doctorAppointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {patient.doctorAppointment.status || 'Pending'}
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No appointment
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(patient)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(patient)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          {/* Appointment Edit Button */}
                          <button
                            onClick={() => handleAppointmentEditClick(patient)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit Appointment"
                          >
                            <Calendar className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(patient)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {currentPatients.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredPatients.length)}</span> of{' '}
                  <span className="font-medium">{filteredPatients.length}</span> patients
                </div>
                <div className="flex items-center gap-2 text-black">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Patient Modal */}
      {showCreateModal && (
        <CreatePatientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePatientCreated}
        />
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                  <p className="text-gray-600">Complete patient information</p>
                </div>
                <button
                  onClick={() => setShowPatientDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {selectedPatient.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-600">
                       <span className='text-black font-bold'> ID: </span>{selectedPatient.uniqueID || selectedPatient._id?.substring(0, 8)}
                       <div><span  className='text-black font-bold'>AppointmentNumber: </span>{selectedPatient.doctorAppointment?.appointmentNumber || 'No Appointment'}</div>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      Personal Information
                    </h4>
                    <InfoRow label="Full Name" value={selectedPatient.name} />
                    <InfoRow label="Gender" value={selectedPatient.gender || 'Not specified'} />
                    <InfoRow label="Age" value={selectedPatient.age || 'Not provided'} />
                    <InfoRow label="Weight" value={selectedPatient.weight ? `${selectedPatient.weight} kg` : 'Not provided'} />
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-indigo-600" />
                      Contact Information
                    </h4>
                    <InfoRow label="Phone" value={selectedPatient.phone || 'Not provided'} />
                    <InfoRow label="Address" value={selectedPatient.address || 'Not provided'} />
                    <InfoRow label="Blood Group" value={selectedPatient.bloodGroup || 'Not tested'} />
                  </div>
                </div>

                {/* Appointment Information */}
                {selectedPatient.doctorAppointment && selectedPatient.doctorAppointment.doctorId ? (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-amber-600" />
                      Appointment Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Doctor Name" value={selectedPatient.doctorAppointment.doctorName || getDoctorName(selectedPatient.doctorAppointment.doctorId)} />
                      <InfoRow label="Charges" value={`PKR ${selectedPatient.doctorAppointment.charges || 0}`} />
                      <InfoRow label="Appointment Date" value={new Date(selectedPatient.doctorAppointment.appointmentDate).toLocaleDateString()} />
                      <InfoRow label="Status" value={selectedPatient.doctorAppointment.status || 'Pending'} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-600 text-center">
                      No appointment assigned to this patient
                    </p>
                  </div>
                )}

                {/* System Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    System Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Registration Date" value={new Date(selectedPatient.createdAt).toLocaleDateString()} />
                    <InfoRow label="Last Updated" value={new Date(selectedPatient.updatedAt || selectedPatient.createdAt).toLocaleDateString()} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleEditClick(selectedPatient)}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Patient
                  </button>
                  <button
                    onClick={() => handleAppointmentEditClick(selectedPatient)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    {selectedPatient.doctorAppointment ? 'Edit Appointment' : 'Add Appointment'}
                  </button>
                  <button className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2" onClick={handlePrintDetails}>
                    <Download className="w-5 h-5" />
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  APPOINTMENT EDIT MODAL*/}
      {showAppointmentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedPatient.doctorAppointment ? 'Edit Appointment' : 'Add Appointment'}
                  </h2>
                  <p className="text-sm text-gray-600">Patient: {selectedPatient.name}</p>
                </div>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAppointmentSubmit}>
                <div className="space-y-4">
                 
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Select Doctor *
  </label>
  <select
    name="doctorId"
    value={appointmentForm.doctorId}
    onChange={handleAppointmentInputChange}
    className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
    required
  >
    <option value="">Select Doctor</option>
    {getDoctors().map(doctor => (
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
  </select>
  <p className="text-xs text-gray-500 mt-1">
    Doctors with no available slots are disabled
  </p>
</div>

                  {/* Appointment Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={appointmentForm.appointmentDate}
                      onChange={handleAppointmentInputChange}
                      className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  
{/* Charges */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Charges (PKR) *
  </label>
  <input
    type="number"
    name="charges"
    value={appointmentForm.charges}
    readOnly
    className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
    placeholder="Auto-filled from doctor's charges"
  />
  <p className="text-xs text-gray-500 mt-1">
    Charges are automatically set from selected doctor's consultation fees
  </p>
</div>
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={appointmentForm.status}
                      onChange={handleAppointmentInputChange}
                      className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    >
                      {appointmentStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                 

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAppointmentModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    
                    {selectedPatient.doctorAppointment && (
                      <button
                        type="button"
                        onClick={handleRemoveAppointment}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg"
                    >
                      {selectedPatient.doctorAppointment ? 'Update' : 'Add Appointment'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Patient</h2>
                  <p className="text-gray-600">Update patient information</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-r  from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age (Years) *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="age"
                            value={editFormData.age}
                            onChange={handleEditInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg) *
                        </label>
                        <div className="relative">
                          <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="weight"
                            value={editFormData.weight}
                            onChange={handleEditInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={editFormData.gender}
                          onChange={handleEditInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                        >
                          <option value="">Select Gender</option>
                          {genders.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Address Information *
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complete Address *
                      </label>
                      <textarea
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditInputChange}
                        rows="3"
                        className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-green-600" />
                      Additional Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            value={editFormData.phone}
                            onChange={handleEditInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          />
                        </div>
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
                            value={editFormData.bloodGroup}
                            onChange={handleEditInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors border border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Update Patient
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && patientToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delete Patient</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{patientToDelete.name}</span>? 
                This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPatientToDelete(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg"
                >
                  Delete Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for info rows
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

export default Reception;