import { useState, useEffect } from "react";
import labStore from "../../store/labStore";
import userStore from "../../store/userStore";
import patientStore from "../../store/patientStore";
import xrayStore from "../../store/xrayStore";
import {
  User, Calendar, Activity, FileText,
  Pill, Stethoscope, Heart, Shield,
  ChevronRight, Download, Printer,
  Clock, AlertCircle, CheckCircle,
  XCircle, Camera, Droplets, Thermometer,
  Eye, FileCheck, FileX
} from "lucide-react";
import toast from "react-hot-toast";

function Patient() {
  const { user } = userStore();
  const { getAllLabRecord, labRecords } = labStore();
  const { getAllPatients, patients } = patientStore();
  const { getAllXrayRecord, xrayRecords } = xrayStore();
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [labRecord, setLabRecord] = useState(null);
  const [xrayRecord, setXrayRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(null);

  const getData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getAllLabRecord(),
        getAllPatients(),
        getAllXrayRecord()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (user?.uniqueId && patients.length > 0) {
      const foundPatient = patients.find(
        item => item.uniqueID === user.uniqueId
      );
      setPatient(foundPatient || null);
    }

    if (user?.uniqueId && labRecords?.records) {
      const foundLabRecord = labRecords.records.find(
        item => item.patientUniqueId === user.uniqueId
      );
      setLabRecord(foundLabRecord || null);
    }

    if (user?.uniqueId && Array.isArray(xrayRecords)) {
      const foundXrayRecord = xrayRecords.find(
        item => item.patientUniqueId === user.uniqueId
      );
      setXrayRecord(foundXrayRecord || null);
    }
  }, [user, patients, labRecords, xrayRecords]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrintMedicalReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Report - ${patient?.name || 'Patient'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { background: #f0f0f0; padding: 10px; font-weight: bold; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .test-result { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
          .status-completed { color: green; }
          .status-pending { color: orange; }
          .xray-images img { max-width: 200px; margin: 5px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MEDICAL REPORT</h1>
          <h2>${patient?.name || ''} - ${patient?.uniqueID || ''}</h2>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        ${patient ? `
          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="info-grid">
              <div><strong>Name:</strong> ${patient.name}</div>
              <div><strong>Patient ID:</strong> ${patient.uniqueID}</div>
              <div><strong>Age:</strong> ${patient.age} years</div>
              <div><strong>Gender:</strong> ${patient.gender}</div>
              <div><strong>Blood Group:</strong> ${patient.bloodGroup}</div>
              <div><strong>Weight:</strong> ${patient.weight} kg</div>
              <div><strong>Phone:</strong> ${patient.phone}</div>
              <div><strong>Address:</strong> ${patient.address}</div>
            </div>
          </div>
        ` : ''}
        
        ${patient?.prescriptions?.length > 0 ? `
          <div class="section">
            <div class="section-title">Prescriptions (${patient.prescriptions.length})</div>
            ${patient.prescriptions.map(p => `
              <div class="test-result">
                <p><strong>Date:</strong> ${formatDate(p.prescribedDate)}</p>
                <p><strong>Doctor:</strong> ${p.doctorName}</p>
                <p><strong>Diagnosis:</strong> ${p.diagnosis}</p>
                <p><strong>Medicines:</strong> ${p.medicines?.length || 0}</p>
                <p><strong>Status:</strong> <span class="status-${p.status.toLowerCase()}">${p.status}</span></p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${labRecord ? `
          <div class="section">
            <div class="section-title">Lab Test Results</div>
            <div class="test-result">
              <p><strong>Test Name:</strong> ${labRecord.testName}</p>
              <p><strong>Category:</strong> ${labRecord.category}</p>
              <p><strong>Doctor:</strong> ${labRecord.doctorName}</p>
              <p><strong>Diagnosis:</strong> ${labRecord.diagnosis}</p>
              <p><strong>Charges Detail:</strong> ${labRecord.overallNotes}</p>
              <p><strong>Status:</strong> <span class="status-${labRecord.status.toLowerCase()}">${labRecord.status}</span></p>
              ${labRecord.parameters?.length > 0 ? `
                <h4>Parameters:</h4>
                ${labRecord.parameters.map(param => `
                  <div style="margin-left: 20px;">
                    <p><strong>${param.parameter}:</strong> ${param.value} ${param.unit}</p>
                    <p><small>Normal Range: ${param.normalRange} | Flag: ${param.flag}</small></p>
                    ${param.notes ? `<p><small>Notes: ${param.notes}</small></p>` : ''}
                  </div>
                `).join('')}
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        ${xrayRecord ? `
          <div class="section">
            <div class="section-title">X-ray Report</div>
            <div class="test-result">
              <p><strong>Test Name:</strong> ${xrayRecord.testName}</p>
              <p><strong>Category:</strong> ${xrayRecord.category}</p>
              <p><strong>Doctor:</strong> ${xrayRecord.doctorName}</p>
              <p><strong>Diagnosis:</strong> ${xrayRecord.diagnosis}</p>
              <p><strong>Overall Notes:</strong> ${xrayRecord.overallNotes}</p>
              <p><strong>Status:</strong> <span class="status-${xrayRecord.status.toLowerCase()}">${xrayRecord.status}</span></p>
              <p><strong>Images:</strong> ${xrayRecord.records?.length || 0}</p>
            </div>
          </div>
        ` : ''}
        
        <div class="footer" style="margin-top: 50px; border-top: 1px solid #000; padding-top: 20px;">
          <p><strong>Hospital Management System</strong></p>
          <p>This is a computer generated report</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.focus();
    } else {
      toast.error('Please allow popups to print report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen text-black bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your patient profile. Please contact hospital administration.
          </p>
          <div className="text-sm text-gray-500">
            <p>Your User ID: <span className="font-mono">{user?.uniqueId || 'N/A'}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black bg-gray-50">
      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">X-ray Image Preview</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black">
              <img
                src={selectedImage}
                alt="X-ray Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 border-t text-center">
              <button
                onClick={() => window.open(selectedImage, '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
              >
                Open Full Size
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Patient Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-full">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{patient.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    ID: {patient.uniqueID}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Age: {patient.age} years
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    {patient.gender}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    Blood: {patient.bloodGroup}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrintMedicalReport}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b">
            <nav className="flex overflow-x-auto">
              {['overview', 'prescriptions', 'tests', 'xrays', 'appointments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Prescriptions</p>
                        <p className="text-2xl font-bold mt-1">
                          {patient.prescriptions?.length || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Pill className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tests Completed</p>
                        <p className="text-2xl font-bold mt-1">
                          {(labRecord ? 1 : 0) + (xrayRecord ? 1 : 0)}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Appointments</p>
                        <p className="text-2xl font-bold mt-1">
                          {patient.doctorAppointment ? 1 : 0}
                        </p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">X-ray Images</p>
                        <p className="text-2xl font-bold mt-1">
                          {xrayRecord?.records?.length || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Camera className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Full Name</label>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Patient ID</label>
                      <p className="font-mono font-medium">{patient.uniqueID}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Age</label>
                      <p className="font-medium">{patient.age} years</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Gender</label>
                      <p className="font-medium">{patient.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Blood Group</label>
                      <p className="font-medium">{patient.bloodGroup}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Weight</label>
                      <p className="font-medium">{patient.weight} kg</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Phone Number</label>
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Address</label>
                      <p className="font-medium">{patient.address}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {patient.prescriptions?.map((prescription, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Prescription #{index + 1}</p>
                            <p className="text-sm text-gray-600">
                              {prescription.diagnosis} • {prescription.doctorName}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {prescription.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(prescription.prescribedDate)}
                        </p>
                      </div>
                    ))}
                    
                    {labRecord && (
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Lab Test: {labRecord.testName}</p>
                            <p className="text-sm text-gray-600">
                              {labRecord.category} • {labRecord.doctorName}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {labRecord.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(labRecord.createdAt)}
                        </p>
                      </div>
                    )}
                    
                    {xrayRecord && (
                      <div className="border-l-4 border-orange-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">X-ray: {xrayRecord.testName}</p>
                            <p className="text-sm text-gray-600">
                              {xrayRecord.category} • {xrayRecord.doctorName}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {xrayRecord.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(xrayRecord.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Prescriptions History
                </h3>
                
                {!patient.prescriptions || patient.prescriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Pill className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No prescriptions found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      You don't have any prescriptions yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {patient.prescriptions.map((prescription, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">
                              Prescription #{index + 1}
                            </h4>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {prescription.status}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatDate(prescription.prescribedDate)}
                              </span>
                           
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              {prescription.medicines?.length || 0} Medicines
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="text-sm text-gray-600">Doctor</label>
                            <p className="font-medium">{prescription.doctorName}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Specialist</label>
                            <p className="font-medium">{prescription.specialist}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Diagnosis</label>
                            <p className="font-medium">{prescription.diagnosis}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Charges</label>
                            <p className="font-medium">{prescription.charges}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Pharmacy Person</label>
                            <p className="font-medium">{prescription.PharmacyPerson}</p>
                          </div>
                        </div>
                        
                        {prescription.medicines && prescription.medicines.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">Medicines</h5>
                            <div className="space-y-3">
                              {prescription.medicines.map((medicine, medIndex) => (
                                <div key={medIndex} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-medium">{medicine.medicineName}</p>
                                      <p className="text-sm text-gray-600">
                                        Dosage: {medicine.dosage} • Frequency: {medicine.frequency}
                                      </p>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      Quantity: {medicine.quantity}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-600">Duration:</span>
                                      <span className="ml-2 font-medium">{medicine.duration}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Timing:</span>
                                      <span className="ml-2 font-medium">{medicine.timing}</span>
                                    </div>
                                    <div className="md:col-span-2">
                                      <span className="text-gray-600">Notes:</span>
                                      <span className="ml-2 font-medium">{medicine.notes || 'None'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tests Tab */}
            {activeTab === 'tests' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Lab Test Results
                </h3>
                
                {!labRecord ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No lab test results found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      You don't have any lab test records yet
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h4 className="font-semibold text-xl text-gray-900">{labRecord.testName}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {labRecord.category}
                          </span>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            labRecord.priority === 'Emergency' 
                              ? 'bg-red-100 text-red-800' 
                              : labRecord.priority === 'Urgent'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {labRecord.priority}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {labRecord.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <p className="text-sm text-gray-600">
                          {formatDate(labRecord.performedDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="text-sm text-gray-600">Doctor</label>
                        <p className="font-medium">{labRecord.doctorName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Performed By</label>
                        <p className="font-medium">{labRecord.performedBy}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Diagnosis</label>
                        <p className="font-medium">{labRecord.diagnosis}</p>
                      </div>
                    
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">Charges Details</label>
                        <p className="font-medium">{labRecord.overallNotes}</p>
                      </div>
                    </div>
                    
                    {labRecord.parameters && labRecord.parameters.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-4">Test Parameters</h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Parameter
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Value
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Normal Range
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Flag
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Notes
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {labRecord.parameters.map((param, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {param.parameter}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="font-medium">{param.value}</span>
                                    <span className="text-gray-600 ml-1">{param.unit}</span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {param.normalRange}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      param.flag === 'High'
                                        ? 'bg-red-100 text-red-800'
                                        : param.flag === 'Low'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {param.flag}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {param.notes || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* X-rays Tab */}
            {activeTab === 'xrays' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  X-ray Reports & Images
                </h3>
                
                {!xrayRecord ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No x-ray reports found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      You don't have any x-ray records yet
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h4 className="font-semibold text-xl text-gray-900">{xrayRecord.testName}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {xrayRecord.category}
                          </span>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            xrayRecord.priority === 'Emergency' 
                              ? 'bg-red-100 text-red-800' 
                              : xrayRecord.priority === 'Urgent'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {xrayRecord.priority}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {xrayRecord.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <p className="text-sm text-gray-600">
                          {formatDate(xrayRecord.performedDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="text-sm text-gray-600">Doctor</label>
                        <p className="font-medium">{xrayRecord.doctorName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Performed By</label>
                        <p className="font-medium">{xrayRecord.performedBy}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Diagnosis</label>
                        <p className="font-medium">{xrayRecord.diagnosis}</p>
                      </div>
                  
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">Charges Details</label>
                        <p className="font-medium">{xrayRecord.overallNotes}</p>
                      </div>
                    </div>
                    
                    {xrayRecord.records && xrayRecord.records.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-4">
                          X-ray Images ({xrayRecord.records.length})
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {xrayRecord.records.map((image, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div 
                                className="aspect-square bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedImage(image.image)}
                              >
                                <img
                                  src={image.image}
                                  alt={`X-ray ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium text-sm">Image {index + 1}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {image.filename}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setSelectedImage(image.image)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                                {image.note && (
                                  <p className="text-sm text-gray-600">{image.note}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointments
                </h3>
                
                {!patient.doctorAppointment ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No appointments found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      You don't have any appointment records
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h4 className="font-semibold text-xl text-gray-900">
                          Appointment #{patient.doctorAppointment.appointmentNumber}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            patient.doctorAppointment.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : patient.doctorAppointment.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {patient.doctorAppointment.status}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            Charges: Rs {patient.doctorAppointment.charges}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <p className="text-sm text-gray-600">
                          {formatDate(patient.doctorAppointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-600">Doctor</label>
                        <p className="font-medium">{patient.doctorAppointment.doctorName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">License Number</label>
                        <p className="font-mono font-medium">{patient.doctorAppointment.licenseNumber}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">Appointment Date</label>
                        <p className="font-medium">
                          {formatDateTime(patient.doctorAppointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Summary & Quick Links */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Emergency Contact
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Hospital Phone</label>
                  <p className="font-medium">+92 123 4567890</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Emergency</label>
                  <p className="font-medium">1122</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Ambulance</label>
                  <p className="font-medium">1020</p>
                </div>
              </div>
            </div>

            {/* Recommended Tests */}
            {patient.recommendedTests && patient.recommendedTests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  Recommended Tests
                </h3>
                <div className="space-y-3">
                  {patient.recommendedTests.map((group, index) => (
                    <div key={index}>
                      {group.tests.map((test, testIndex) => (
                        <div key={testIndex} className="mb-3 last:mb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{test.testName}</p>
                              <p className="text-xs text-gray-500">{test.category}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              test.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : test.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {test.status}
                            </span>
                          </div>
                          {test.instructions && (
                            <p className="text-xs text-gray-600 mt-1">{test.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Medical Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Last Visit</span>
                    <span className="text-sm font-medium">
                      {patient.doctorAppointment 
                        ? formatDate(patient.doctorAppointment.appointmentDate)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Last Prescription</span>
                    <span className="text-sm font-medium">
                      {patient.prescriptions?.length > 0
                        ? formatDate(patient.prescriptions[patient.prescriptions.length - 1].prescribedDate)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Last Test</span>
                    <span className="text-sm font-medium">
                      {labRecord 
                        ? formatDate(labRecord.performedDate)
                        : xrayRecord
                        ? formatDate(xrayRecord.performedDate)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
             
                <button 
                  onClick={handlePrintMedicalReport}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">Print Full Report</span>
                  <Printer className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Hospital Management System • Patient Portal • Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-1">For emergencies, call 1122 or visit the nearest hospital</p>
        </div>
      </div>
    </div>
  );
}

export default Patient;