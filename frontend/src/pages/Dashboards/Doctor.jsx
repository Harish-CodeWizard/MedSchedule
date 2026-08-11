import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Download,
  Stethoscope,
  Bell,
  RefreshCw,
  CalendarDays,
  FileText,
  X,
  Activity,
  TrendingUp,
  BarChart3,
  BellOff,
  Pill,
  Camera
} from 'lucide-react';
import patientStore from '../../store/patientStore';
import userStore from '../../store/userStore';
import { useNavigate } from "react-router-dom";

function Doctor() {
  const navigate = useNavigate();
  const { patients, loading, getAllPatients, updatePatient } = patientStore();
  const { user, getAllUsers,allUsers } = userStore(); // Current logged-in user
  // State variables
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  
  const patientsPerPage = 10;

  // Fetch data and set current doctor
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Fetch patients and users
    getAllPatients();
    getAllUsers();
    
    // Set current doctor from logged-in user
    if (user && user.role === 'Doctor') {
      setCurrentDoctor(user);
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [user]);

  // Filter patients for current doctor
  useEffect(() => {
    if (!currentDoctor || !patients.length) {
      setFilteredPatients([]);
      return;
    }

    const doctorId = currentDoctor._id;
    
    let filtered = patients.filter(patient => 
      patient.doctorAppointment && 
      patient.doctorAppointment.doctorId === doctorId
    );

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.uniqueID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient =>
        patient.doctorAppointment?.status === statusFilter
      );
    }

    // Apply date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateFilter === 'today') {
      filtered = filtered.filter(patient => {
        if (!patient.doctorAppointment?.appointmentDate) return false;
        const appointmentDate = new Date(patient.doctorAppointment.appointmentDate);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(patient => {
        if (!patient.doctorAppointment?.appointmentDate) return false;
        const appointmentDate = new Date(patient.doctorAppointment.appointmentDate);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate < today;
      });
    }

    setFilteredPatients(filtered);
  }, [patients, currentDoctor, searchTerm, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Calculate stats
  const stats = {
    totalPatients: patients.filter(p => 
      p.doctorAppointment && 
      p.doctorAppointment.doctorId === currentDoctor?._id
    ).length,
    
    todayAppointments: patients.filter(p => {
      if (!p.doctorAppointment || p.doctorAppointment.doctorId !== currentDoctor?._id) return false;
      const appointmentDate = new Date(p.doctorAppointment.appointmentDate);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    }).length,
    
    pendingToday: patients.filter(p => {
      if (!p.doctorAppointment || p.doctorAppointment.doctorId !== currentDoctor?._id) return false;
      const appointmentDate = new Date(p.doctorAppointment.appointmentDate);
      const today = new Date();
      return (
        appointmentDate.toDateString() === today.toDateString() &&
        p.doctorAppointment.status === 'Pending'
      );
    }).length,
    
    completedToday: patients.filter(p => {
      if (!p.doctorAppointment || p.doctorAppointment.doctorId !== currentDoctor?._id) return false;
      const appointmentDate = new Date(p.doctorAppointment.appointmentDate);
      const today = new Date();
      return (
        appointmentDate.toDateString() === today.toDateString() &&
        p.doctorAppointment.status === 'Completed'
      );
    }).length,
    
    todayTotalEarnings: patients.filter(p => {
      if (!p.doctorAppointment || p.doctorAppointment.doctorId !== currentDoctor?._id) return false;
      const appointmentDate = new Date(p.doctorAppointment.appointmentDate);
      const today = new Date();
      return (
        appointmentDate.toDateString() === today.toDateString() &&
        p.doctorAppointment && 
        p.doctorAppointment.doctorId === currentDoctor?._id &&
        p.doctorAppointment.status === 'Completed'
      );
    }).reduce((sum, patient) => sum + (patient.doctorAppointment?.charges || 0), 0),

    totalEarnings: patients.filter(p => 
      p.doctorAppointment && 
      p.doctorAppointment.doctorId === currentDoctor?._id &&
      p.doctorAppointment.status === 'Completed'
    ).reduce((sum, patient) => sum + (patient.doctorAppointment?.charges || 0), 0)
  };

  // Get today's appointments sorted by appointmentNumber
  const getTodayAppointments = () => {
    const today = new Date();
    
    const todayPatients = filteredPatients.filter(patient => {
      if (!patient.doctorAppointment?.appointmentDate) return false;
      const appointmentDate = new Date(patient.doctorAppointment.appointmentDate);
      return appointmentDate.toDateString() === today.toDateString();
    });

    // Sort by appointmentNumber in ascending order (1, 2, 3...)
    return todayPatients.sort((a, b) => {
      // Get appointment numbers, default to a large number if not found
      const numA = a.doctorAppointment?.appointmentNumber || 999999;
      const numB = b.doctorAppointment?.appointmentNumber || 999999;
      
      // Convert to numbers for proper numeric sorting
      return Number(numA) - Number(numB);
    });
  };

  const todayAppointments = getTodayAppointments();

  // Handle status change
  const handleStatusChange = async (patientId, newStatus) => {
    const patient = patients.find(p => p._id === patientId);
    if (!patient || !patient.doctorAppointment) return;

    const updatedData = {
      doctorAppointment: {
        ...patient.doctorAppointment,
        status: newStatus
      }
    };

    const success = await updatePatient(patientId, updatedData);
    if (success) {
      getAllPatients();
      if (selectedPatient && selectedPatient._id === patientId) {
        setSelectedPatient({
          ...selectedPatient,
          doctorAppointment: updatedData.doctorAppointment
        });
      }
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      case 'Pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

// Replace exportPatientData with handlePrintDetails
const exportPatientData = (patient) => {
  if (!patient) {
    alert('Please select a patient first');
    return;
  }
  
  const printWindow = window.open('', '_blank');
  
  // Helper function to safely get values
  const safeGet = (value, defaultValue = 'Not specified') => {
    return value !== undefined && value !== null && value !== '' ? value : defaultValue;
  };
  
  // Prepare data according to your structure
  const data = {
    'Patient ID': safeGet(patient.uniqueID, patient._id?.substring(0, 8)),
    'Name': safeGet(patient.name),
    'Age': safeGet(patient.age),
    'Gender': safeGet(patient.gender),
    'Phone': safeGet(patient.phone),
    'Address': safeGet(patient.address),
    'Blood Group': safeGet(patient.bloodGroup),
    'Weight': safeGet(patient.weight ? `${patient.weight} kg` : 'N/A'),
    'Appointment Date': patient.doctorAppointment?.appointmentDate ? 
      new Date(patient.doctorAppointment.appointmentDate).toLocaleDateString() : 'N/A',
    'Status': patient.doctorAppointment?.status || 'N/A',
    'Charges': patient.doctorAppointment?.charges || 0,
    'Doctor': patient.doctorAppointment?.doctorName || 'N/A',
    'Appointment Number': patient.doctorAppointment?.appointmentNumber || 'N/A',
    'Registration Date': patient.createdAt ? 
      new Date(patient.createdAt).toLocaleDateString() : 'N/A',
    'Last Updated': patient.updatedAt ? 
      new Date(patient.updatedAt).toLocaleDateString() : 
      (patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A')
  };
  // Get doctor info
  const doctorData = allUsers.find(user => user._id === patient.doctorAppointment?.doctorId);
  const licenseNumber = doctorData?.licenseNumber || 'N/A';
  const specialist = doctorData?.SpecialistDoctor || 'N/A';
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Patient Details - ${data['Name']}</title>
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
            min-width: 180px;
          }
          .info-value {
            font-weight: 500;
            color: #1e293b;
            text-align: right;
            flex: 1;
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
          .status-na { background: #e2e8f0; color: #475569; }
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
          .no-appointment {
            background: #f1f5f9;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 16px;
          }
          .doctor-details {
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
            border: 1px solid #7dd3fc;
          }
          .doctor-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          @media print {
            body { 
              padding: 15px; 
              background: white; 
              font-size: 12px;
            }
            .no-print { display: none; }
            .hospital-info {
              background: #4f46e5 !important;
              -webkit-print-color-adjust: exact;
            }
            .appointment-section {
              background: #fff7ed !important;
              -webkit-print-color-adjust: exact;
            }
            .doctor-details {
              background: #e0f2fe !important;
              -webkit-print-color-adjust: exact;
            }
            .info-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        </style>
      </head>
      <body>
        <div class="hospital-info">
          <div class="hospital-name">Hospital Management System</div>
          <div>Patient Medical Record</div>
          <div class="patient-id">Patient ID: ${data['Patient ID']}</div>
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
              <span class="info-value">${data['Name']}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Age:</span>
              <span class="info-value">${data['Age']}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gender:</span>
              <span class="info-value">${data['Gender']}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Weight:</span>
              <span class="info-value">${data['Weight']}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Blood Group:</span>
              <span class="info-value">${data['Blood Group']}</span>
            </div>
          </div>
          
          <h2 class="section-title">Contact Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Phone Number:</span>
              <span class="info-value">${data['Phone']}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Address:</span>
              <span class="info-value">${data['Address']}</span>
            </div>
          </div>
          
          <h2 class="section-title">System Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Registration Date:</span>
              <span class="info-value">${data['Registration Date']}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated:</span>
              <span class="info-value">${data['Last Updated']}</span>
            </div>
          </div>
        </div>
        
        ${patient.doctorAppointment?.doctorId ? `
          <div class="appointment-section">
            <h2 class="section-title">Appointment Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Appointment Number:</span>
                <span class="info-value">${data['Appointment Number']}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Appointment Date:</span>
                <span class="info-value">${data['Appointment Date']}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Charges:</span>
                <span class="info-value">PKR ${data['Charges']}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">
                  ${data['Status']}
                  <span class="status-badge status-${data['Status'].toLowerCase().replace(/[^a-z]/g, '')}">
                    ${data['Status'].toUpperCase()}
                  </span>
                </span>
              </div>
            </div>
            
            <div class="doctor-details">
              <h3 style="color: #0369a1; margin-top: 0; margin-bottom: 10px;">Doctor Information</h3>
              <div class="doctor-item">
                <span style="font-weight: 600; color: #475569;">Doctor Name:</span>
                <span style="font-weight: 500; color: #1e293b;">${data['Doctor']}</span>
              </div>
              <div class="doctor-item">
                <span style="font-weight: 600; color: #475569;">License Number:</span>
                <span style="font-weight: 500; color: #1e293b;">${licenseNumber}</span>
              </div>
              <div class="doctor-item">
                <span style="font-weight: 600; color: #475569;">Specialization:</span>
                <span style="font-weight: 500; color: #1e293b;">${specialist}</span>
              </div>
            </div>
          </div>
        ` : `
          <div class="no-appointment">
            <p>
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
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome, Dr. {currentDoctor?.name || 'Doctor'} | 
                <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                  {currentDoctor?.SpecialistDoctor || 'General Practitioner'}
                </span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Consultation: {currentDoctor?.ConsultationTime || 'Not set'}
                </p>
                <p className="text-xs text-gray-600">
                  Charges: PKR {currentDoctor?.ConsultationCharges || '0'} | 
                  Time/Patient: {currentDoctor?.ConsultationTimePerPatient || 'N/A'} mins
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <Stethoscope className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPatients}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{stats.todayAppointments}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Pending: {stats.pendingToday} | Completed: {stats.completedToday}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Today</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pendingToday}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Todays Earnings</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{stats.todayTotalEarnings}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">PKR {stats.totalEarnings}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments Sequence */}
        {todayAppointments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                Today's Appointments
              </h3>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="space-y-3">
              {todayAppointments.map((patient,index) => (
                <div
                  key={patient._id}
                  className={`p-4 rounded-lg border ${
                    patient.doctorAppointment?.status === 'Completed' 
                      ? 'bg-green-50 border-green-200' 
                      : patient.doctorAppointment?.status === 'Cancelled'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Circle shows appointmentNumber */}
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {patient.doctorAppointment?.appo || `${index + 1}`}
                      </div>
                       
                      <div>
                        <h4 className="font-medium text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">
                          Appointment #: <span className="font-bold">{patient.doctorAppointment?.appointmentNumber || 'N/A'}</span> | 
                          ID: {patient.uniqueID || patient._id?.substring(0, 8)} | 
                          Age: {patient.age} | 
                          Phone: {patient.phone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(patient.doctorAppointment?.status)}`}>
                        {getStatusIcon(patient.doctorAppointment?.status)}
                        {patient.doctorAppointment?.status || 'Pending'}
                      </span>
                      
                      <div className="flex gap-2">
                       
                         {patient.doctorAppointment?.status === 'Pending' || patient.doctorAppointment?.status === 'Come' ? (
  <>
    <button
      onClick={() => {
        const newStatus = patient.doctorAppointment?.status === 'Come' ? 'Pending' : 'Come';
        handleStatusChange(patient._id, newStatus);
      }}
      className={`px-3 py-1 text-white text-xs rounded-lg transition-colors flex items-center gap-1 ${
        patient.doctorAppointment?.status === 'Come' 
          ? 'bg-yellow-600 hover:bg-yellow-700' 
          : 'bg-cyan-500 hover:bg-cyan-600'
      }`}
    >
      {patient.doctorAppointment?.status === 'Come' ? (
        <>
          <BellOff className="w-3 h-3" />
          Silent
        </>
      ) : (
        <>
          <Bell className="w-3 h-3" />
          Come
        </>
      )}
    </button>
    
    <button
      onClick={() => handleStatusChange(patient._id, 'Completed')}
      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
    >
      Mark Complete
    </button>
    
    <button
      onClick={() => handleStatusChange(patient._id, 'Cancelled')}
      className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
    >
      Cancel
    </button>
  </>
) : (
  <button
    onClick={() => handleStatusChange(patient._id, 'Pending')}
    className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
  >
    Mark as Pending
  </button>
)}
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Come">Come</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="past">Past</option>
              </select>

              <button
                onClick={() => getAllPatients()}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* All Patients Table */}
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
                    Appointment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                            <div className="text-xs text-gray-500">
                              Age: {patient.age} | Gender: {patient.gender}
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
                            {patient.bloodGroup ? `Blood: ${patient.bloodGroup}` : 'No blood group'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {patient.doctorAppointment?.appointmentDate ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {new Date(patient.doctorAppointment.appointmentDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Charges: PKR {patient.doctorAppointment.charges || 0}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No appointment</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.doctorAppointment?.status)}`}>
                          {getStatusIcon(patient.doctorAppointment?.status)}
                          {patient.doctorAppointment?.status || 'No Status'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          
                          {patient.doctorAppointment?.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(patient._id, 'Completed')}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusChange(patient._id, 'Cancelled')}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          
                         <button
  onClick={() => exportPatientData(patient)}
  className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
>
  <Download className="w-4 h-4" />
  Export
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 " />
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
                    className="p-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                  <p className="text-gray-600">Complete patient information and medical history</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm">
  {/* Avatar */}
  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
    <span className="text-white text-2xl font-bold">
      {selectedPatient.name?.charAt(0).toUpperCase()}
    </span>
  </div>

  {/* Patient Info & Actions */}
  <div className="flex-1">
    <h3 className="text-lg font-bold text-gray-900">{selectedPatient.name}</h3>
    <p className="text-sm text-gray-600 mb-3">
      <span className="font-medium text-gray-800">ID:</span> {selectedPatient.uniqueID?.substring(0, 12) || 'N/A'}
    </p>
    
    {/* Action Buttons */}
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => navigate("/medicine", { 
          state: {patientID: selectedPatient._id, doctorID: currentDoctor._id} 
        })}
        className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm flex items-center gap-1.5 shadow hover:shadow-md transition-all"
      >
        <Pill className="w-3.5 h-3.5" />
        Medicine
      </button>

      <button
        onClick={() => navigate("/recommendTest", { 
          state: {patientID: selectedPatient._id, doctorID: currentDoctor._id} 
        })}
        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center gap-1.5 shadow hover:shadow-md transition-all"
      >
        <Activity className="w-3.5 h-3.5" />
        Lab Test
      </button>

      <button
        onClick={() => navigate("/recommendXray", { 
          state: {patientID: selectedPatient._id, doctorID: currentDoctor._id} 
        })}
        className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm flex items-center gap-1.5 shadow hover:shadow-md transition-all"
      >
        <Camera className="w-3.5 h-3.5" />
        X-Ray
      </button>

      <button
        onClick={() => navigate("/patientDetailsByDoctor", { 
          state: {uniqueId: selectedPatient.uniqueID} 
        })}
        className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm flex items-center gap-1.5 shadow hover:shadow-md transition-all"
      >
        <FileText className="w-3.5 h-3.5" />
        Results
      </button>
    </div>
  </div>
</div>
                {/* <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {selectedPatient.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                    <div className="flex flex-wrap items-center gap-8 justify-around mt-2">
                      <div className="text-sm text-gray-600">
                        <span className='text-black font-bold'>ID:</span> {selectedPatient.uniqueID || selectedPatient._id?.substring(0, 8)}
                      </div>













<div>
  <button
    onClick={() => navigate("/medicine", { state: {patientID:selectedPatient._id,doctorID:currentDoctor._id} })}
    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
  >
    <Pill className="w-4 h-4" />
    Medicine
  </button>
</div>

<div>
  <button
    onClick={() => navigate("/recommendTest", { state: {patientID:selectedPatient._id,doctorID:currentDoctor._id} })}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
  >
    <Activity className="w-4 h-4" />
    Lab Tests
  </button>
</div>

<div>
  <button
    onClick={() => navigate("/recommendXray", { state: {patientID:selectedPatient._id,doctorID:currentDoctor._id} })}
    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
  >
    <Camera className="w-4 h-4" />
    X-Ray
  </button>
</div>

<div>
  <button
    onClick={() => navigate("/patientDetailsByDoctor", { state: {uniqueId:selectedPatient.uniqueID} })}
    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
  >
    <Activity className="w-4 h-4" />
    Result
  </button>
</div>














                     
                    </div>
                  </div>
                </div> */}

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      Personal Information
                    </h4>
                    <InfoRow label="Full Name" value={selectedPatient.name} />
                    <InfoRow label="Gender" value={selectedPatient.gender || 'Not specified'} />
                    <InfoRow label="Age" value={selectedPatient.age || 'Not provided'} />
                    <InfoRow label="Weight" value={selectedPatient.weight ? `${selectedPatient.weight} kg` : 'Not provided'} />
                    <InfoRow label="Blood Group" value={selectedPatient.bloodGroup || 'Not tested'} />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-indigo-600" />
                      Contact Information
                    </h4>
                    <InfoRow label="Phone" value={selectedPatient.phone || 'Not provided'} />
                    <InfoRow label="Address" value={selectedPatient.address || 'Not provided'} />
                    <InfoRow label="Registration Date" value={new Date(selectedPatient.createdAt).toLocaleDateString()} />
                    <InfoRow label="Last Updated" value={new Date(selectedPatient.updatedAt || selectedPatient.createdAt).toLocaleDateString()} />
                  </div>
                </div>

                {/* Appointment Information */}
                {selectedPatient.doctorAppointment && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      Appointment Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Appointment Number" value={selectedPatient.doctorAppointment.appointmentNumber || 'N/A'} />
                      <InfoRow label="Appointment Date" value={new Date(selectedPatient.doctorAppointment.appointmentDate).toLocaleDateString()} />
                      <InfoRow label="Status" value={selectedPatient.doctorAppointment.status || 'Pending'} />
                      <InfoRow label="Charges" value={`PKR ${selectedPatient.doctorAppointment.charges || 0}`} />
                      <InfoRow label="Doctor" value={selectedPatient.doctorAppointment.doctorName || 'Dr. Unknown'} />
                    </div>
                    
                    {/* Status Actions */}
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <h5 className="font-medium text-gray-900 mb-2">Update Appointment Status:</h5>
                      <div className="flex flex-wrap gap-2">
                     {(selectedPatient.doctorAppointment.status === 'Pending' || selectedPatient.doctorAppointment.status === 'Come') && (
  <>
    <button
      onClick={() => {
        // Toggle between Pending and Come
        const newStatus = selectedPatient.doctorAppointment.status === 'Come' ? 'Pending' : 'Come';
        handleStatusChange(selectedPatient._id, newStatus);
      }}
      className="px-4 py-2 text-white rounded-lg bg-black transition-colors flex items-center gap-2"
    >
      {selectedPatient.doctorAppointment.status === 'Come' ? (
        <div className="relative">
          <Bell className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
      ) : (
        <Bell className="w-5 h-5" />
      )}
      <span>
        {selectedPatient.doctorAppointment.status === 'Come' ? 'Silent Bell' : 'Call Patient'}
      </span>
    </button>
    
    <button
      onClick={() => {
        handleStatusChange(selectedPatient._id, 'Completed');
        setSelectedPatient(null);
      }}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      Mark as Completed
    </button>
    
    <button
      onClick={() => {
        handleStatusChange(selectedPatient._id, 'Cancelled');
        setSelectedPatient(null);
      }}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Cancel Appointment
    </button>
  </>
)}
                        
                        {(selectedPatient.doctorAppointment.status === 'Completed' || selectedPatient.doctorAppointment.status === 'Cancelled') && (
                          <button
                            onClick={() => {
                              handleStatusChange(selectedPatient._id, 'Pending');
                              setSelectedPatient(null);
                            }}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Mark as Pending
                          </button>
                        )}
                        
                        <button
                          onClick={() => exportPatientData(selectedPatient)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
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

export default Doctor;

