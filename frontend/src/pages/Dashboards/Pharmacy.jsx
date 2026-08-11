import React, { useState } from 'react';
import patientStore from '../../store/patientStore';
import prescriptionStore from '../../store/prescriptionStore';
import { 
  Printer, Search, Pill, User, CheckCircle, XCircle, FileText, Plus, 
  Activity,
  History
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

function Pharmacy() {
  const { getPatientByUniqueId, singlePatient, updatePatient } = patientStore();
  const { addPresception } = prescriptionStore();
  const location = useLocation();
  const { name } = location.state || {};
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientFound, setPatientFound] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [updatedMedicines, setUpdatedMedicines] = useState([]);
  const [totalCharges, setTotalCharges] = useState(0);
  const [printing, setPrinting] = useState(false);
  
  // New state for manual record
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    patientName: '',
    patientPhone: '',
    medicines: [{ name: '', quantity: '', price: '' }],
    totalCharges: 0
  });

  const navigate = useNavigate();

  // const handleSearch = async () => {
  //   if (!searchId.trim()) {
  //     alert('Please enter Patient ID');
  //     return;
  //   }
    
  //   setLoading(true);
  //   try {
  //     await getPatientByUniqueId(searchId);
      
  //     if (singlePatient) {
  //       setPatientFound(true);
  //       const pendingPrescriptions = singlePatient.prescriptions?.filter(p => 
  //         p.status === 'Pending' || p.status === 'pending'
  //       );
        
  //       if (pendingPrescriptions.length > 0) {
  //         setSelectedPrescription(pendingPrescriptions[0]);
  //         const medicinesWithCharges = pendingPrescriptions[0].medicines.map(med => ({
  //           ...med,
  //           pharmacyCharges: '',
  //           dispensed: false
  //         }));
  //         setUpdatedMedicines(medicinesWithCharges);
  //         calculateTotal(medicinesWithCharges);
  //       }
  //     } else {
  //       setPatientFound(false);
  //       alert('Patient not found with this ID');
  //     }
  //   } catch (error) {
  //     console.error('Error searching patient:', error);
  //     alert('Error searching patient');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // CORRECTED calculateTotal function
  
  const handleSearch = async () => {
  if (!searchId.trim()) {
    alert('Please enter Patient ID');
    return;
  }
  
  setLoading(true);
  setPatientFound(false); // Reset patient found state
  
  try {
    // Directly call the API and wait for response
    const patient = await getPatientByUniqueId(searchId);
    
    // Check if patient was actually found
    if (patient) {
      setPatientFound(true);
      const pendingPrescriptions = patient.prescriptions?.filter(p => 
        p.status === 'Pending' || p.status === 'pending'
      );
      
      if (pendingPrescriptions.length > 0) {
        setSelectedPrescription(pendingPrescriptions[0]);
        const medicinesWithCharges = pendingPrescriptions[0].medicines.map(med => ({
          ...med,
          pharmacyCharges: '',
          dispensed: false
        }));
        setUpdatedMedicines(medicinesWithCharges);
        calculateTotal(medicinesWithCharges);
      }
    } else {
      setPatientFound(false);
      alert('Patient not found with this ID');
    }
  } catch (error) {
    console.error('Error searching patient:', error);
    alert('Error searching patient');
    setPatientFound(false);
  } finally {
    setLoading(false);
  }
};

  const calculateTotal = (medicines) => {
    const total = medicines.reduce((sum, med) => {
      const pricePerUnit = parseFloat(med.pharmacyCharges) || 0;
      const quantity = parseInt(med.quantity) || 1;
      const totalForMedicine = pricePerUnit * quantity;
      return sum + totalForMedicine;
    }, 0);
    setTotalCharges(total);
  };

  const updateMedicineCharge = (index, charges) => {
    const updated = [...updatedMedicines];
    updated[index].pharmacyCharges = charges;
    setUpdatedMedicines(updated);
    calculateTotal(updated);
  };

  const toggleDispensed = (index) => {
    const updated = [...updatedMedicines];
    updated[index].dispensed = !updated[index].dispensed;
    setUpdatedMedicines(updated);
  };

  /* ================= ADD RECORD FUNCTIONS ================= */
  const handleAddMedicine = () => {
    setNewRecord({
      ...newRecord,
      medicines: [...newRecord.medicines, { name: '', quantity: '', price: '' }]
    });
  };

  const handleRemoveMedicine = (index) => {
    const updatedMedicines = newRecord.medicines.filter((_, i) => i !== index);
    setNewRecord({
      ...newRecord,
      medicines: updatedMedicines
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...newRecord.medicines];
    updatedMedicines[index][field] = value;
    
    // CORRECTED calculation for manual record
    const total = updatedMedicines.reduce((sum, med) => {
      const price = parseFloat(med.price) || 0;
      const quantity = parseInt(med.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    setNewRecord({
      ...newRecord,
      medicines: updatedMedicines,
      totalCharges: total
    });
  };

const handleSaveManualRecord = async () => {
  if (newRecord.medicines.length === 0) {
    alert('Please add at least one medicine');
    return;
  }

  const incompleteMedicines = newRecord.medicines.filter(med => 
    !med.name.trim() || !med.quantity || !med.price
  );
  
  if (incompleteMedicines.length > 0) {
    alert('Please fill all medicine details');
    return;
  }

  try {
    // Prepare data for addPresception function
    const prescriptionData = {
      patientName: newRecord.patientName,
      patientPhone: newRecord.patientPhone || 'N/A',
      charges: newRecord.totalCharges,
      PharmacyPerson: name,
      medicines: newRecord.medicines.map(med => ({
        medicineName: med.name,
        quantity: parseInt(med.quantity) || 1, // Ensure it's a number
        pharmacyCharges: parseFloat(med.price) || 0, // This is the correct field name
        dispensed: true,
        dispensedDate: new Date().toISOString()
      }))
    };

    // Call addPresception function from prescriptionStore
    const result = await addPresception(prescriptionData);
    
    if (result && result.success) {
      // Reset form
      setNewRecord({
        patientName: '',
        patientPhone: '',
        medicines: [{ name: '', quantity: '', price: '' }],
        totalCharges: 0
      });
      setShowAddRecord(false);
      
      alert('Record added successfully!');
    } else {
      alert('Failed to save record. Please try again.');
    }
  } catch (error) {
    console.error('Error saving record:', error);
    alert('Error saving record. Please try again.');
  }
};
  /* ================= COMPLETE PRESCRIPTION ================= */
  const handleCompletePrescription = async () => {
    if (!selectedPrescription) return;
    
    const allDispensed = updatedMedicines.every(med => med.dispensed);
    if (!allDispensed) {
      const confirm = window.confirm('Some medicines are not marked as dispensed. Continue anyway?');
      if (!confirm) return;
    }
    
    setLoading(true);
    try {
      // CORRECTED calculation for prescription completion
      const totalChargesValue = updatedMedicines.reduce((sum, med) => {
        const pricePerUnit = parseFloat(med.pharmacyCharges) || 0;
        const quantity = parseInt(med.quantity) || 1;
        const totalForMedicine = pricePerUnit * quantity;
        return sum + totalForMedicine;
      }, 0);
      
      const updatedPrescriptions = singlePatient.prescriptions.map(p => {
        if (p._id === selectedPrescription._id) {
          return {
            ...p,
            status: 'Completed',
            completedDate: new Date().toISOString(),
            charges: totalChargesValue,
            PharmacyPerson: name,
            medicines: p.medicines.map((med, index) => ({
              ...med,
              dispensed: updatedMedicines[index]?.dispensed || false,
              dispensedDate: updatedMedicines[index]?.dispensed ? new Date().toISOString() : null,
              pharmacyCharges: parseFloat(updatedMedicines[index]?.pharmacyCharges) || 0
            }))
          };
        }
        return p;
      });
      
      const updatedData = {
        prescriptions: updatedPrescriptions
      };

      console.log('Updating prescription:', {
        prescriptionId: selectedPrescription._id,
        prescriptionCharges: totalChargesValue,
        medicineCount: selectedPrescription.medicines.length
      });

      const success = await updatePatient(singlePatient._id, updatedData);
      
      if (success) {
        alert(`Prescription completed successfully! Total charges: PKR ${totalChargesValue.toFixed(2)}`);
        await getPatientByUniqueId(searchId);
        setSelectedPrescription(null);
        setUpdatedMedicines([]);
        setTotalCharges(0);
      } else {
        alert('Failed to complete prescription');
      }
    } catch (error) {
      console.error('Error completing prescription:', error);
      alert(`Error completing prescription: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRINT BILL ================= */
  const handlePrintBill = () => {
    setPrinting(true);
    const printWindow = window.open('', '_blank');
    
    // Calculate total for print bill
    const printTotal = updatedMedicines.reduce((sum, med) => {
      const pricePerUnit = parseFloat(med.pharmacyCharges) || 0;
      const quantity = parseInt(med.quantity) || 1;
      return sum + (pricePerUnit * quantity);
    }, 0);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Pharmacy Bill - ${singlePatient?.name}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
              color: #333;
              background: #f8f9fa;
            }
            .bill-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              padding: 30px 40px;
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              color: white;
              border-radius: 12px;
              margin-bottom: 30px;
            }
            .header h2 { 
              color: white; 
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
            }
            .patient-info { 
              margin-bottom: 30px; 
              background: white; 
              padding: 25px; 
              border-radius: 12px; 
              border: 1px solid #e2e8f0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            }
            .medicine-table th, 
            .medicine-table td { 
              padding: 14px 16px; 
              text-align: left; 
              border-bottom: 1px solid #e2e8f0;
            }
            .medicine-table th {
              color: white;
              font-weight: 600;
              font-size: 13px;
            }
            .total-section {
              margin-top: 30px;
              padding: 20px;
              background: #f0f9ff;
              border-radius: 12px;
              border: 1px solid #bae6fd;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
              border-top: 2px solid #e2e8f0;
              padding-top: 20px;
            }
            .status-badge {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            @media print {
              body { padding: 15px; background: white; }
              .no-print { display: none; }
              .header { background: #059669 !important; -webkit-print-color-adjust: exact; }
              .medicine-table thead { background: #059669 !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="header">
              <h2>Pharmacy Medicine Dispensing Bill</h2>
              <div style="font-size: 15px; opacity: 0.9;">
                Date: ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div class="patient-info">
              <div style="color: #059669; border-bottom: 2px solid #a7f3d0; padding-bottom: 10px; margin-bottom: 15px; font-size: 18px; font-weight: 600;">
                Patient Information
              </div>
              <p><strong>Patient:</strong> <span style="color: #1e293b; font-weight: 600;">${singlePatient?.name}</span></p>
              <p><strong>Patient ID:</strong> <span style="background: #e0e7ff; color: #059669; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: 600;">${singlePatient?.uniqueID}</span></p>
              <p><strong>Age:</strong> ${singlePatient?.age} | <strong>Gender:</strong> ${singlePatient?.gender}</p>
            </div>
            
            ${selectedPrescription?.diagnosis ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #fbbf24;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Diagnosis</h3>
                <p style="color: #78350f;">${selectedPrescription.diagnosis}</p>
              </div>
            ` : ''}
            
            <table class="medicine-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Frequency</th>
                  <th>Price per Unit</th>
                  <th>Total (PKR)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${updatedMedicines.map(med => {
                  const pricePerUnit = parseFloat(med.pharmacyCharges) || 0;
                  const quantity = parseInt(med.quantity) || 1;
                  const medicineTotal = pricePerUnit * quantity;
                  
                  return `
                  <tr>
                    <td><strong>${med.medicineName}</strong></td>
                    <td>${med.dosage || '-'}</td>
                    <td>${med.quantity}</td>
                    <td>${med.frequency}</td>
                    <td><strong>PKR ${pricePerUnit.toFixed(2)}</strong></td>
                    <td><strong>PKR ${medicineTotal.toFixed(2)}</strong></td>
                    <td>
                      <span class="status-badge ${med.dispensed ? 'status-completed' : 'status-pending'}">
                        ${med.dispensed ? 'Dispensed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
            
            <div class="total-section">
              <div style="text-align: right;">
                <div style="font-size: 18px; margin-bottom: 10px;">
                  <span style="color: #64748b;">Total Charges:</span>
                  <span style="font-size: 24px; font-weight: 700; color: #059669; margin-left: 15px;">
                  PKR ${printTotal.toFixed(2)}
                </span>
                </div>
                <div style="color: #64748b; font-size: 14px;">
                  PharmacyPerson: ${name}
                </div>
                </div>
                <div style="color: #64748b; font-size: 14px;">
                  ${selectedPrescription?.prescribedDate ? `Prescribed on: ${new Date(selectedPrescription.prescribedDate).toLocaleDateString()}` : ''}
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing our pharmacy services</p>
              <p>Hospital Management System © ${new Date().getFullYear()}</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 40px;">
            <button onclick="window.print()" style="
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              color: white; 
              border: none; 
              padding: 14px 28px; 
              border-radius: 8px; 
              cursor: pointer; 
              font-size: 16px;
              font-weight: 600;
            ">
              🖨️ Print Bill
            </button>
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
    setPrinting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Pill className="w-8 h-8 text-emerald-600" />
                Pharmacy Dispensing System
              </h1>
              <p className="text-gray-600 mt-1">Search patient by ID to dispense medicines</p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowAddRecord(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Record (Walk-in)
              </button>
             
              <button 
                onClick={() => navigate('/WalkInRecords')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                Walk In Records
              </button>
               
              <button 
                onClick={() => navigate('/pharmacyRecords')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                Records
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-emerald-50 p-6 rounded-lg mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Patient ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-mono"
                    placeholder="HMS-260113-0002"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Patient
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Record Modal */}
          {showAddRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Plus className="w-6 h-6 text-blue-600" />
                      Add Walk-in Patient Record
                    </h2>
                    <button
                      onClick={() => setShowAddRecord(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <XCircle className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Patient Information */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={newRecord.patientName}
                      onChange={(e) => setNewRecord({...newRecord, patientName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter patient name"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={newRecord.patientPhone}
                      onChange={(e) => setNewRecord({...newRecord, patientPhone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Medicines Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Medicines *
                      </label>
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Medicine
                      </button>
                    </div>

                    {newRecord.medicines.map((medicine, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-end">
                        <div className="col-span-5">
                          <label className="block text-xs text-gray-600 mb-1">
                            Medicine Name *
                          </label>
                          <input
                            type="text"
                            value={medicine.name}
                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Medicine name"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs text-gray-600 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            value={medicine.quantity}
                            onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Qty"
                            min="1"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs text-gray-600 mb-1">
                            Price (PKR) *
                          </label>
                          <input
                            type="number"
                            value={medicine.price}
                            onChange={(e) => handleMedicineChange(index, 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Price"
                            min="0"
                            required
                          />
                        </div>
                        <div className="col-span-1">
                          {newRecord.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicine(index)}
                              className="w-full p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <XCircle className="w-4 h-4 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Total Charges */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          Total Charges:
                        </span>
                        <span className="text-2xl font-bold text-green-700">
                          PKR {newRecord.totalCharges.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowAddRecord(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveManualRecord}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Save Record
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
 
          {patientFound && singlePatient && (
            <>
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-emerald-50 p-5 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
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

                <div className="bg-blue-50 p-5 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Prescription Details
                  </h3>
                  {selectedPrescription ? (
                    <div className="space-y-2">
                      <InfoRow label="Doctor" value={selectedPrescription.doctorName} />
                      <InfoRow label="Specialist" value={selectedPrescription.specialist} />
                      <InfoRow label="Prescribed Date" value={new Date(selectedPrescription.prescribedDate).toLocaleDateString()} />
                      <InfoRow label="Status" value={
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedPrescription.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedPrescription.status}
                        </span>
                      } />
                    </div>
                  ) : (
                    <p className="text-gray-500">No pending prescriptions found</p>
                  )}
                </div>
              </div>

              {/* Diagnosis */}
              {selectedPrescription?.diagnosis && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Diagnosis
                  </h3>
                  <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
                </div>
              )}

              {/* Medicines List with Edit */}
              {selectedPrescription && updatedMedicines.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-emerald-600" />
                        Prescribed Medicines
                        <span className="text-sm font-normal text-gray-500">
                          ({updatedMedicines.length} medicines)
                        </span>
                      </h3>
                      <div className="text-lg font-bold text-emerald-700">
                        Total: PKR {totalCharges.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Medicine
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Dosage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Frequency
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Timing
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Price per Unit (PKR)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Total (PKR)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Dispensed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {updatedMedicines.map((medicine, index) => {
                          const pricePerUnit = parseFloat(medicine.pharmacyCharges) || 0;
                          const quantity = parseInt(medicine.quantity) || 1;
                          const medicineTotal = pricePerUnit * quantity;
                          
                          return (
                            <tr key={medicine._id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {medicine.medicineName}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{medicine.dosage || '-'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{medicine.quantity}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{medicine.frequency}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{medicine.timing}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{medicine.duration} days</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={medicine.pharmacyCharges || ''}
                                    onChange={(e) => updateMedicineCharge(index, e.target.value)}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    min="0"
                                    placeholder="0"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-emerald-700">
                                  PKR {medicineTotal.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => toggleDispensed(index)}
                                  className={`p-2 rounded-full ${medicine.dispensed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'} hover:opacity-80`}
                                >
                                  {medicine.dispensed ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : (
                                    <XCircle className="w-5 h-5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedPrescription && (
                <div className="flex flex-wrap gap-4 justify-end mt-8">
                  <button
                    onClick={handlePrintBill}
                    disabled={printing || updatedMedicines.length === 0}
                    className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-4 h-4" />
                    {printing ? 'Printing...' : 'Print Bill'}
                  </button>

                  <button
                    onClick={handleCompletePrescription}
                    disabled={loading || updatedMedicines.length === 0}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Complete Prescription
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

export default Pharmacy;