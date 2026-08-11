import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import patientStore from '../../store/patientStore';
import userStore from '../../store/userStore';
import { Printer, FileText, Pill, User, Plus, Trash2, Stethoscope, Calculator, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
function Medicine() {
  const location = useLocation();
  const { patientID, doctorID } = location.state || {};
const navigate = useNavigate()
  const { getPatientById, singlePatient, updatePatient, deleteMedicine } = patientStore();
  const { getUserById, singleUser } = userStore();
const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);


// Add this function to cancel editing
const handleCancelEdit = () => {
  setPrescription({
    doctorId: doctorID,
    doctorName: singleUser?.name || '',
    specialist: singleUser?.SpecialistDoctor || '',
    prescribedDate: new Date().toISOString(),
    diagnosis: '',
    medicines: []
  });
  setDiagnosis('');
  setNewMedicine({
    medicineName: '',
    dosage: '',
    quantity: '',
    frequency: '',
    timing: '',
    duration: '',
    notes: '',
    calculatedQuantity: 0,
    charges: 0,
    status: 'Pending',
    PharmacyPerson: '',
  });
  setEditingPrescriptionId(null);
};

  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState({
    doctorId: doctorID,
    doctorName: '',
    specialist: '',
    prescribedDate: new Date().toISOString(),
    diagnosis: '',
    medicines: []
  });
  
  const [newMedicine, setNewMedicine] = useState({
    medicineName: '',
    dosage: '',
    quantity: '',
    frequency: '',
    timing: '',
    duration: '',
    notes: '',
    calculatedQuantity: 0,
    charges: 0,
    status: 'Pending',
    PharmacyPerson:'',
  });
  
  const [loading, setLoading] = useState(false);

  // Frequency options from enum
  const frequencyOptions = [
    "Once a day",
    "Twice a day",
    "Three times a day",
    "Morning",
    "Morning & Evening",
    "Morning Afternoon Night",
    "Night"
  ];

  // Timing options from enum
  const timingOptions = [
    "Before Meal",
    "After Meal",
    "With Meal"
  ];

  // Function to get frequency count per day
  const getFrequencyCount = (frequency) => {
    switch (frequency) {
      case "Once a day":
      case "Morning":
      case "Night":
        return 1;
      case "Twice a day":
      case "Morning & Evening":
        return 2;
      case "Three times a day":
      case "Morning Afternoon Night":
        return 3;
      default:
        return 0;
    }
  };

  // Function to extract number of days from duration string
  const extractDaysFromDuration = (duration) => {
    if (!duration) return 0;
    
    const lowerDuration = duration.toLowerCase();
    
    // Check for common patterns
    if (lowerDuration.includes('day')) {
      const daysMatch = duration.match(/\d+/);
      return daysMatch ? parseInt(daysMatch[0]) : 0;
    } else if (lowerDuration.includes('week')) {
      const weeksMatch = duration.match(/\d+/);
      return weeksMatch ? parseInt(weeksMatch[0]) * 7 : 0;
    } else if (lowerDuration.includes('month')) {
      const monthsMatch = duration.match(/\d+/);
      return monthsMatch ? parseInt(monthsMatch[0]) * 30 : 0; // Approximate
    } else {
      // Try to extract any number
      const numberMatch = duration.match(/\d+/);
      return numberMatch ? parseInt(numberMatch[0]) : 0;
    }
  };

  // Function to calculate total quantity
  const calculateQuantity = (frequency, duration) => {
    const timesPerDay = getFrequencyCount(frequency);
    const totalDays = extractDaysFromDuration(duration);
    
    return timesPerDay * totalDays;
  };

// Update calculated quantity when frequency or duration changes
useEffect(() => {
  if (newMedicine.frequency && newMedicine.duration) {
    const calculatedQty = calculateQuantity(newMedicine.frequency, newMedicine.duration);
    if (calculatedQty > 0) {
      setNewMedicine(prev => ({
        ...prev,
        calculatedQuantity: calculatedQty,
        // Auto-fill quantity field
        quantity: calculatedQty.toString()
      }));
    }
  }
}, [newMedicine.frequency, newMedicine.duration]);
  const getpatient = async () => {
    await getPatientById(patientID);
  };

  const getdoctor = async () => {
    await getUserById(doctorID);
  };

  useEffect(() => {
    getpatient();
    getdoctor();
  }, []);

  // Initialize prescription data when doctor data is loaded
  useEffect(() => {
    if (singleUser) {
      setPrescription(prev => ({
        ...prev,
        doctorId: doctorID,
        doctorName: singleUser.name || '',
        specialist: singleUser.SpecialistDoctor || ''
      }));
    }
  }, [singleUser, doctorID]);

  // Load existing prescription data if available
  useEffect(() => {
    if (singlePatient && singlePatient.prescriptions && singlePatient.prescriptions.length > 0) {
      const latestPrescription = singlePatient.prescriptions[singlePatient.prescriptions.length - 1];
      setPrescription(latestPrescription);
      setDiagnosis(latestPrescription.diagnosis || '');
    }
  }, [singlePatient]);

  const handleAddMedicine = () => {
    if (!newMedicine.medicineName.trim()) return;
    
    // Use calculated quantity if quantity field is empty
    const finalQuantity = newMedicine.quantity || newMedicine.calculatedQuantity;
    
    const medicineWithId = {
      ...newMedicine,
      id: Date.now(),
      quantity: finalQuantity ? parseInt(finalQuantity) : undefined,
      // Remove calculatedQuantity from final object
      calculatedQuantity: undefined
    };
    
    // Remove calculatedQuantity property
    delete medicineWithId.calculatedQuantity;
    
    const updatedMedicines = [...prescription.medicines, medicineWithId];
    setPrescription({...prescription, medicines: updatedMedicines});
    
    // Reset form
    setNewMedicine({
      medicineName: '',
      dosage: '',
      quantity: '',
      frequency: '',
      timing: '',
      duration: '',
      notes: '',
      calculatedQuantity: 0,
      charges: 0,
      status:'Pending',
      PharmacyPerson:'',
    });
  };

const handleRemoveMedicine = async (prescriptionIndex, medicineId) => {
  try {
    // For locally added medicines (not yet saved to DB)
    if (!prescriptionIndex) {
      const updatedMedicines = prescription.medicines.filter(med => med.id !== medicineId);
      setPrescription({...prescription, medicines: updatedMedicines});
      return;
    }
    
    // For medicines already saved in the database
    const success = await deleteMedicine(patientID, prescriptionIndex, medicineId);
    if (success) {
      // Remove from local state
      const updatedMedicines = prescription.medicines.filter(med => med._id !== medicineId);
      setPrescription({...prescription, medicines: updatedMedicines});
      
      // Refresh patient data
      await getPatientById(patientID);
    }
  } catch (error) {
    console.error('Error removing medicine:', error);
    alert('Failed to remove medicine');
  }
};

const handleSavePrescription = async () => {
  if (!singlePatient || prescription.medicines.length === 0) {
    alert('Please add at least one medicine');
    return;
  }
 
  setLoading(true);
  try {
    const prescriptionData = {
      ...prescription,
      diagnosis: diagnosis,
      prescribedDate: new Date().toISOString()
    };

    // Remove temporary id and calculatedQuantity from medicines
    const cleanedMedicines = prescriptionData.medicines.map(({ id, calculatedQuantity, ...rest }) => rest);
    prescriptionData.medicines = cleanedMedicines;

    // Get the latest patient data
    const currentPatientData = await getPatientById(patientID);
    const existingPrescriptions = currentPatientData?.prescriptions || [];
    
    // Check for duplicate prescription
    const isDuplicate = existingPrescriptions.some(existingRec => {
      // Compare doctor, diagnosis, and medicines
      if (existingRec.doctorId !== prescriptionData.doctorId) return false;
      if (existingRec.diagnosis !== prescriptionData.diagnosis) return false;
      
      // Compare medicine arrays
      if (existingRec.medicines.length !== prescriptionData.medicines.length) return false;
      
      // Deep compare each medicine
      for (let i = 0; i < existingRec.medicines.length; i++) {
        const existingMed = existingRec.medicines[i];
        const newMed = prescriptionData.medicines[i];
        
        if (existingMed.medicineName !== newMed.medicineName ||
            existingMed.dosage !== newMed.dosage ||
            existingMed.frequency !== newMed.frequency ||
            existingMed.timing !== newMed.timing ||
            existingMed.duration !== newMed.duration) {
          return false;
        }
      }
      return true;
    });
    
    if (isDuplicate && !editingPrescriptionId) {
      const confirmSave = window.confirm(
        'A prescription with identical medicines already exists. Do you want to save it anyway?'
      );
      if (!confirmSave) {
        setLoading(false);
        return;
      }
    }

    // ============ ADD NEW CODE HERE ============
    let updatedPrescriptions;

    if (editingPrescriptionId) {
      // UPDATE MODE
      const prescriptionIndex = existingPrescriptions.findIndex(
        rec => rec._id === editingPrescriptionId
      );
      
      if (prescriptionIndex !== -1) {
        updatedPrescriptions = [...existingPrescriptions];
        
        // Preserve the original _id
        const updatedPrescription = {
          ...prescriptionData,
          _id: editingPrescriptionId
        };
        
        updatedPrescriptions[prescriptionIndex] = updatedPrescription;
      } else {
        // If not found (was deleted), add as new
        updatedPrescriptions = [...existingPrescriptions, prescriptionData];
      }
    } else {
      // CREATE MODE
      updatedPrescriptions = [...existingPrescriptions, prescriptionData];
    }
    // ============ END OF NEW CODE ============

    // Prepare update data - ONLY update prescriptions
    const updatedData = {
      prescriptions: updatedPrescriptions
    };

    console.log('Saving prescription:', {
      editingPrescriptionId,
      existingCount: existingPrescriptions.length,
      newCount: updatedPrescriptions.length,
      isDuplicate: isDuplicate
    });

    const success = await updatePatient(singlePatient._id, updatedData);
    if (success) {
      alert(editingPrescriptionId ? 'Prescription updated successfully!' : 'Prescription saved successfully!');
      
      // Refresh patient data
      await getPatientById(patientID);
      
      // Reset form
      handleCancelEdit();
      navigate('/doctor-dashboard')
    } else {
      alert('Failed to save prescription');
    }
  } catch (error) {
    console.error('Error saving prescription:', error);
    alert(`Failed to save prescription: ${error.message}`);
  } finally {
    setLoading(false);
  }
};




const handlePrintPrescription = () => {
  const printWindow = window.open('', '_blank');
 
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Prescription - ${singlePatient?.name}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px; 
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
          }
          .prescription-container {
            max-width: 1000px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            padding: 40px 50px 30px;
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            color: white;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
          }
          .header h2 { 
            color: white; 
            margin: 0 0 10px 0;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 5px 0;
          }
          .date-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 20px;
            border-radius: 50px;
            font-weight: 500;
            backdrop-filter: blur(10px);
            margin-top: 10px;
          }
          .prescription-id {
            position: absolute;
            top: 30px;
            right: 30px;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 20px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            backdrop-filter: blur(10px);
          }
          .patient-info { 
            margin-bottom: 30px; 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          .patient-info p {
            font-size: 16px;
            margin: 12px 0;
            padding: 12px 20px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .patient-info strong {
            color: #4f46e5;
            font-weight: 600;
            margin-right: 8px;
          }
          .section-title {
            color: #4f46e5;
            border-bottom: 2px solid #c7d2fe;
            padding-bottom: 10px;
            margin: 30px 0 20px 0;
            font-size: 20px;
            font-weight: 600;
          }
          .medicine-table { 
            width: 100%; 
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            background: white;
          }
          .medicine-table thead {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          }
          .medicine-table th, 
          .medicine-table td { 
            padding: 16px 20px; 
            text-align: left; 
            border-bottom: 1px solid #e2e8f0;
          }
          .medicine-table th {
            color: white;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .medicine-table tbody tr {
            transition: all 0.2s ease;
          }
          .medicine-table tbody tr:hover {
            background: #f5f3ff;
          }
          .medicine-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          .medicine-table td {
            color: #374151;
            font-size: 14px;
          }
          .medicine-table td:first-child {
            font-weight: 600;
            color: #4f46e5;
          }
          .footer { 
            margin-top: 50px; 
            border-top: 2px solid #e2e8f0; 
            padding-top: 30px; 
            background: #f8fafc;
            border-radius: 12px;
            padding: 30px;
          }
          .signature { 
            float: right; 
            text-align: center;
            padding: 25px 35px;
            background: white;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            min-width: 280px;
          }
          .signature p:first-child {
            margin: 20px auto 15px;
            width: 200px;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, #4f46e5 50%, transparent 100%);
            position: relative;
          }
          .signature p:first-child::before {
            content: '';
            position: absolute;
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 12px;
            background: #4f46e5;
            border-radius: 50%;
          }
          .signature strong {
            font-size: 18px;
            color: #4f46e5;
            display: block;
            margin: 10px 0 5px;
          }
          .signature p:not(:first-child) {
            margin: 6px 0;
            color: #64748b;
          }
          .diagnosis { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            padding: 25px 30px; 
            border-radius: 12px; 
            margin: 25px 0;
            border: 1px solid #fbbf24;
            box-shadow: 0 2px 10px rgba(251, 191, 36, 0.1);
          }
          .diagnosis h3 {
            color: #92400e;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
          }
          .diagnosis p {
            color: #78350f;
            font-size: 16px;
            line-height: 1.6;
            margin: 0;
          }
          .print-date {
            text-align: right;
            color: #64748b;
            font-size: 14px;
            margin-bottom: 20px;
            padding: 10px 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            display: inline-block;
          }
          .no-print { 
            text-align: center; 
            margin-top: 30px;
            padding: 30px;
          }
          @media print {
            body { 
              padding: 15px; 
              background: white; 
            }
            .no-print { 
              display: none; 
            }
            .header {
              background: #4f46e5 !important;
              -webkit-print-color-adjust: exact;
            }
            .medicine-table thead {
              background: #4f46e5 !important;
              -webkit-print-color-adjust: exact;
            }
            .diagnosis {
              background: #fef3c7 !important;
              -webkit-print-color-adjust: exact;
            }
          }
          @media (max-width: 768px) {
            body {
              padding: 15px;
            }
            .header,
            .patient-info,
            .footer {
              padding: 20px;
            }
            .medicine-table {
              display: block;
              overflow-x: auto;
            }
            .signature {
              float: none;
              margin: 0 auto;
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="prescription-container">
          <div class="header">
            <div class="prescription-id">
              Prescription #${prescription._id?.substring(0, 8).toUpperCase() || 'RX-' + Date.now().toString().slice(-6)}
            </div>
            <h2>Medical Prescription</h2>
            <div class="header-subtitle">Hospital Management System</div>
            <div class="date-badge">
              Date: ${new Date(prescription.prescribedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <div class="print-date">
            Printed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          <div class="patient-info">
            <div style="color: #4f46e5; border-bottom: 2px solid #c7d2fe; padding-bottom: 10px; margin-bottom: 20px; font-size: 18px; font-weight: 600;">
              Patient Information
            </div>
            <p><strong>Patient:</strong> <span style="color: #1e293b; font-weight: 600;">${singlePatient?.name}</span></p>
            <p><strong>Age:</strong> ${singlePatient?.age} | <strong>Gender:</strong> ${singlePatient?.gender}</p>
            <p><strong>Patient ID:</strong> <span style="background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: 600;">${singlePatient?.uniqueID}</span></p>
            <p><strong>Blood Group:</strong> <span style="color: #dc2626; font-weight: 600; background: #fee2e2; padding: 4px 12px; border-radius: 6px;">${singlePatient?.bloodGroup || 'Not specified'}</span></p>
          </div>
          
          ${diagnosis ? `
            <div class="diagnosis">
              <h3>Diagnosis</h3>
              <p>${diagnosis}</p>
            </div>
          ` : ''}
          
          <div class="section-title">Prescribed Medicines</div>
          <table class="medicine-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Quantity</th>
                <th>Frequency</th>
                <th>Timing</th>
                <th>Duration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medicines.map(med => `
                <tr>
                  <td>${med.medicineName}</td>
                  <td><span style="background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 6px; font-weight: 500;">${med.dosage || '-'}</span></td>
                  <td>${med.quantity || '-'}</td>
                  <td>${med.frequency || '-'}</td>
                  <td>${med.timing || '-'}</td>
                  <td>${med.duration || '-'}</td>
                  <td><small style="color: #64748b;">${med.notes || '-'}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <div class="signature">
              <p>_______________________</p>
              <p><strong>Dr. ${prescription.doctorName || 'Doctor'}</strong></p>
              <p>${prescription.specialist || 'General Practitioner'}</p>
              <p style="font-size: 14px; color: #94a3b8;">License: ${singleUser?.licenseNumber  || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        <div class="no-print">
          <button onclick="window.print()" style="
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            color: white; 
            border: none; 
            padding: 14px 28px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          ">
            🖨️ Print Prescription
          </button>
          <p style="color: #64748b; margin-top: 10px; font-size: 14px;">Click above button to print this prescription</p>
        </div>
        
        <script>
          setTimeout(() => {
            window.print();
          }, 1000);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

  if (!singlePatient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
     
<div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
      <Pill className="w-8 h-8 text-indigo-600" />
      Medicine Prescription
 
    </h1>
   
  </div>
  
  <div className="flex flex-wrap gap-3 mt-4 md:mt-0">


    
    <button
      onClick={handlePrintPrescription}
      disabled={prescription.medicines.length === 0}
      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Printer className="w-4 h-4" />
      Print
    </button>
    
    <button
      onClick={handleSavePrescription}
      disabled={loading || prescription.medicines.length === 0}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {editingPrescriptionId ? 'Updating...' : 'Saving...'}
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          {editingPrescriptionId ? 'Update' : 'Save'} Prescription
        </>
      )}
    </button>
  </div>
</div>
          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Patient Information
              </h3>
              <div className="space-y-2">
                <InfoRow label="Name" value={singlePatient.name} />
                <InfoRow label="Age" value={singlePatient.age} />
                <InfoRow label="Gender" value={singlePatient.gender} />
                <InfoRow label="Patient ID" value={singlePatient.uniqueID} />
                <InfoRow label="Blood Group" value={singlePatient.bloodGroup || 'Not specified'} />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-amber-600" />
                Doctor Information
              </h3>
              <div className="space-y-2">
                <InfoRow label="Doctor Name" value={singleUser?.name || 'Loading...'} />
                <InfoRow label="Specialization" value={singleUser?.SpecialistDoctor || 'Not specified'} />
                <InfoRow label="License No" value={singleUser?.licenseNumber || 'Not specified'} />
                <InfoRow label="Contact" value={singleUser?.phone || 'Not specified'} />
              </div>
            </div>
          </div>

          {/* Diagnosis Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Diagnosis
            </h3>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter patient diagnosis (e.g., Fever, Infection, etc.)"
              rows="3"
            />
          </div>

          {/* Add Medicine Form */}
          <div className="bg-white border text-black border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add New Medicine
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={newMedicine.medicineName}
                  onChange={(e) => setNewMedicine({...newMedicine, medicineName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Paracetamol"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={newMedicine.dosage}
                  onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 500mg"
                />
              </div>

             


{/* Frequency Field - Updated */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Frequency *
  </label>
  <select
    value={newMedicine.frequency}
    onChange={(e) => {
      setNewMedicine({...newMedicine, frequency: e.target.value});
      // Auto-update quantity when frequency changes
      if (newMedicine.duration) {
        const calculatedQty = calculateQuantity(e.target.value, newMedicine.duration);
        if (calculatedQty > 0) {
          setNewMedicine(prev => ({
            ...prev,
            frequency: e.target.value,
            quantity: calculatedQty.toString(),
            calculatedQuantity: calculatedQty
          }));
        }
      }
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    required
  >
    <option value="">Select Frequency</option>
    {frequencyOptions.map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
  {newMedicine.frequency && (
    <p className="text-xs text-gray-500 mt-1">
      {getFrequencyCount(newMedicine.frequency)} times per day
    </p>
  )}
</div>

{/* Duration Field - Updated */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Duration *
  </label>
  <input
    type="text"
    value={newMedicine.duration}
    onChange={(e) => {
      setNewMedicine({...newMedicine, duration: e.target.value});
      // Auto-update quantity when duration changes
      if (newMedicine.frequency) {
        const calculatedQty = calculateQuantity(newMedicine.frequency, e.target.value);
        if (calculatedQty > 0) {
          setNewMedicine(prev => ({
            ...prev,
            duration: e.target.value,
            quantity: calculatedQty.toString(),
            calculatedQuantity: calculatedQty
          }));
        }
      }
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    placeholder="e.g., 5 days, 1 week, 10 days"
    required
  />
  {newMedicine.duration && (
    <p className="text-xs text-gray-500 mt-1">
      {extractDaysFromDuration(newMedicine.duration)} days total
    </p>
  )}
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timing *
                </label>
                <select
                  value={newMedicine.timing}
                  onChange={(e) => setNewMedicine({...newMedicine, timing: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Timing</option>
                  {timingOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

 </div>
           
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

    

{/* Quantity Field - Updated */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Quantity *
  </label>
  <input
    type="number"
    value={newMedicine.quantity}
    onChange={(e) => setNewMedicine({...newMedicine, quantity: e.target.value})}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    placeholder="Auto-calculated"
    min="1"
    required
  />
  {newMedicine.calculatedQuantity > 0 && (
    <p className="text-xs text-gray-500 mt-1">
      Calculated: {newMedicine.calculatedQuantity} units ({getFrequencyCount(newMedicine.frequency)}× daily × {extractDaysFromDuration(newMedicine.duration)} days)
    </p>
  )}
</div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={newMedicine.notes}
                  onChange={(e) => setNewMedicine({...newMedicine, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Avoid cold water, Take with milk"
                />
              </div>
            </div>

            {/* Calculation Summary */}
            {newMedicine.frequency && newMedicine.duration && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Quantity Calculation</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Frequency:</span>{' '}
                    <span className="font-medium">{newMedicine.frequency}</span> = {getFrequencyCount(newMedicine.frequency)}× daily
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>{' '}
                    <span className="font-medium">{newMedicine.duration}</span> = {extractDaysFromDuration(newMedicine.duration)} days
                  </div>
                  <div className="md:text-right">
                    <span className="text-gray-600">Total Quantity:</span>{' '}
                    <span className="font-bold text-lg text-green-700">
                      {newMedicine.calculatedQuantity} units
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAddMedicine}
              disabled={!newMedicine.medicineName.trim() || !newMedicine.frequency || !newMedicine.timing || !newMedicine.duration || !newMedicine.quantity}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </button>
          </div>

          {/* Medicine List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-indigo-600" />
                  Prescribed Medicines ({prescription.medicines.length})
                </h3>
                <span>
    {/* Status row add karo */}
    {singlePatient.prescriptions && singlePatient.prescriptions.length > 0 && (
   
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            singlePatient.prescriptions[singlePatient.prescriptions.length - 1].status === 'Completed' 
              ? 'bg-green-100 text-green-800' 
              : singlePatient.prescriptions[singlePatient.prescriptions.length - 1].status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {singlePatient.prescriptions[singlePatient.prescriptions.length - 1].status}
          </span>
     
    )}
    </span>
                {diagnosis && (
                  <div className="text-sm text-gray-700 bg-blue-50 px-3 py-1 rounded">
                    <span className="font-medium">Diagnosis:</span> {diagnosis}
                  </div>
                )}
              </div>
              {/* Patient Information section mein add karo */}

            </div>

            {prescription.medicines.length === 0 ? (
              <div className="p-12 text-center">
                <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No medicines prescribed yet</p>
                <p className="text-gray-500 text-sm mt-1">Add medicines using the form above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicine Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dosage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prescription.medicines.map((medicine, index) => (
                      <tr key={medicine.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {medicine.medicineName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{medicine.dosage || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {medicine.quantity || '-'}
                            {medicine.calculatedQuantity && (
                              <span className="text-xs text-gray-500 ml-1">
                                (calculated)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{medicine.frequency || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{medicine.timing || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{medicine.duration || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{medicine.notes || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <button
  onClick={() => handleRemoveMedicine(
    prescription._id || null, // Use prescription._id if exists, otherwise null
    medicine._id || medicine.id // Use _id for saved medicines, id for local
  )}
  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
>
  <Trash2 className="w-4 h-4" />
</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

export default Medicine;