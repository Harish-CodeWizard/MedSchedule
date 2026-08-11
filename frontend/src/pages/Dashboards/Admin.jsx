import React, { useEffect, useState } from "react";
import userStore from "../../store/userStore";
import patientStore from "../../store/patientStore";
import prescriptionStore from "../../store/prescriptionStore";
import labStore from "../../store/labStore";
import xrayStore from "../../store/xrayStore";

function Admin() {
  const { allUsers, getAllUsers } = userStore();
  const { patients, getAllPatients } = patientStore();
  const { medicines, getAllPresception } = prescriptionStore();
  const { labRecords, getAllLabRecord } = labStore();
  const { xrayRecords, getAllXrayRecord, getAllWalkInXrayRecords } = xrayStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [walkinXrayData, setWalkinXrayData] = useState(null);
const [prescriptionSubTab, setPrescriptionSubTab] = useState("patient");
  const getData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getAllUsers(),
        getAllPatients(),
        getAllPresception(),
        getAllLabRecord(),
        getAllXrayRecord()
      ]);
      const walkinData = await getAllWalkInXrayRecords();
      setWalkinXrayData(walkinData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalPatients = patients?.length || 0;
    const totalDoctors = allUsers?.filter(user => user.role === "Doctor")?.length || 0;
    const totalStaff = allUsers?.filter(user => user.role !== "Patient" && user.role !== "Admin")?.length || 0;
    const totalWalkinPrescriptions = medicines?.length || 0;
    
    // Get prescriptions from patients
    let totalPatientPrescriptions = 0;
    if (patients) {
      patients.forEach(patient => {
        totalPatientPrescriptions += patient.prescriptions?.length || 0;
      });
    }
    
    const totalPrescriptions = totalWalkinPrescriptions + totalPatientPrescriptions;
    const totalLabTests = labRecords?.records?.length || 0;
    const totalXrays = (xrayRecords?.length || 0) + (walkinXrayData?.records?.length || 0);
    
    return { 
      totalPatients, 
      totalDoctors, 
      totalStaff, 
      totalWalkinPrescriptions,
      totalPatientPrescriptions,
      totalPrescriptions, 
      totalLabTests, 
      totalXrays 
    };
  };

  const stats = calculateStats();

  // Get all patient prescriptions (from patients array)
  const getAllPatientPrescriptions = () => {
    const allPrescriptions = [];
    
    if (patients) {
      patients.forEach(patient => {
        if (patient.prescriptions && patient.prescriptions.length > 0) {
          patient.prescriptions.forEach(prescription => {
            allPrescriptions.push({
              ...prescription,
              patientId: patient._id,
              patientName: patient.name,
              patientPhone: patient.phone,
              patientUniqueId: patient.uniqueID,
              patientAge: patient.age,
              patientGender: patient.gender,
              type: "patient_prescription"
            });
          });
        }
      });
    }
    
    return allPrescriptions;
  };

 

  const patientPrescriptions = getAllPatientPrescriptions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading hospital data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hospital Admin Dashboard</h1>
        <p className="text-gray-600">Complete overview of hospital activities and operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.137a10 10 0 01-.671.463" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Patients</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Doctors</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Staff Category</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
            </div>
          </div>
        </div>

       
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-4 font-medium ${activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`py-3 px-4 font-medium ${activeTab === "patients" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            >
              Patients ({patients?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`py-3 px-4 font-medium ${activeTab === "prescriptions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            >
              Prescriptions ({stats.totalPrescriptions})
            </button>
            <button
              onClick={() => setActiveTab("lab")}
              className={`py-3 px-4 font-medium ${activeTab === "lab" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            >
              Lab Tests ({labRecords?.records?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("xray")}
              className={`py-3 px-4 font-medium ${activeTab === "xray" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            >
              X-Ray Reports ({stats.totalXrays})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-3 px-4 font-medium ${activeTab === "users" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
            >
              Users ({allUsers?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
            
            {/* Recent Patients */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Recent Patients</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescriptions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {patients?.slice(0, 5).map(patient => (
                      <tr key={patient._id}>
                        <td className="px-4 py-3 text-sm">{patient.uniqueID}</td>
                        <td className="px-4 py-3 text-sm font-medium">{patient.name}</td>
                        <td className="px-4 py-3 text-sm">{patient.age}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${patient.prescriptions?.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {patient.prescriptions?.length || 0} prescriptions
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${patient.doctorAppointment?.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {patient.doctorAppointment?.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Medical Activities</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Patient Prescriptions</span>
                    <span className="font-semibold">{stats.totalPatientPrescriptions}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Walk-in Prescriptions</span>
                    <span className="font-semibold">{stats.totalWalkinPrescriptions}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Lab Tests Completed</span>
                    <span className="font-semibold">{stats.totalLabTests}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>X-Ray Reports</span>
                    <span className="font-semibold">{stats.totalXrays}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Staff Distribution</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Doctors</span>
                    <span className="font-semibold">{stats.totalDoctors}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Reception</span>
                    <span className="font-semibold">{allUsers?.filter(u => u.role === "Reception")?.length || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Lab Technicians</span>
                    <span className="font-semibold">{allUsers?.filter(u => u.role === "Lab")?.length || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Pharmacy Staff</span>
                    <span className="font-semibold">{allUsers?.filter(u => u.role === "Pharmacy")?.length || 0}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "patients" && (
          <div>
            <h2 className="text-xl font-bold mb-4">All Patients ({patients?.length || 0})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age/Gender</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescriptions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients?.map(patient => (
                    <tr key={patient._id}>
                      <td className="px-4 py-3 text-sm font-medium">{patient.uniqueID}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-gray-500 text-xs">{patient.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{patient.age} / {patient.gender}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          {patient.bloodGroup}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${patient.prescriptions?.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {patient.prescriptions?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(patient.doctorAppointment?.appointmentDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${patient.doctorAppointment?.status === "Completed" ? "bg-green-100 text-green-800" : 
                                       patient.doctorAppointment?.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                                       "bg-blue-100 text-blue-800"}`}>
                          {patient.doctorAppointment?.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
{activeTab === "prescriptions" && (
  <div>
    <h2 className="text-xl font-bold mb-4">All Prescriptions ({stats.totalPrescriptions})</h2>
    
    {/* Tab navigation for prescription types */}
    <div className="mb-6">
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setPrescriptionSubTab("patient")}
          className={`py-2 px-4 font-medium ${prescriptionSubTab === "patient" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
        >
          Patient Prescriptions ({patientPrescriptions.length})
        </button>
        <button
          onClick={() => setPrescriptionSubTab("walkin")}
          className={`py-2 px-4 font-medium ${prescriptionSubTab === "walkin" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
        >
          Walk-in Prescriptions ({medicines?.length || 0})
        </button>
      </div>
    </div>

    {/* Patient Prescriptions Content */}
    {prescriptionSubTab === "patient" && (
      <div>
        <h3 className="text-lg font-semibold mb-3">Patient Prescriptions</h3>
        {patientPrescriptions.length > 0 ? (
          <div className="space-y-4">
            {patientPrescriptions.map((prescription, index) => (
              <div key={`patient-${prescription._id}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-blue-600">Patient: {prescription.patientName || "N/A"}</h3>
                    <p className="text-sm text-gray-600">ID: {prescription.patientUniqueId || "N/A"} | Phone: {prescription.patientPhone || "N/A"}</p>
                    <p className="text-sm text-gray-600">Age: {prescription.patientAge || "N/A"} | Gender: {prescription.patientGender || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">{formatDate(prescription.prescribedDate || prescription.createdAt)}</span>
                    <div className="mt-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-2">
                        Patient Prescription
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Total: {prescription.charges || 0} Rs
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Doctor:</span> {prescription.doctorName || "N/A"} 
                  {prescription.diagnosis && <span className="ml-4">Diagnosis: {prescription.diagnosis}</span>}
                </div>
                {prescription.medicines && prescription.medicines.length > 0 ? (
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Medicines Prescribed:</h4>
                      <span className="text-sm text-gray-600">
                        Dispensed by: {prescription.PharmacyPerson || "N/A"}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {prescription.medicines.map((med, idx) => (
                        <li key={idx} className="text-sm bg-white p-2 rounded">
                          <div className="font-medium">{med.medicineName || "Unknown Medicine"}</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mt-1">
                            {med.dosage && <div>Dosage: {med.dosage}</div>}
                            {med.quantity && <div>Quantity: {med.quantity}</div>}
                            {med.duration && <div>Duration: {med.duration}</div>}
                            {med.frequency && <div>Frequency: {med.frequency}</div>}
                            {med.timing && <div>Timing: {med.timing}</div>}
                            {med.notes && <div className="md:col-span-2">Notes: {med.notes}</div>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-yellow-700 text-sm">No medicines listed in this prescription</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No patient prescriptions found</p>
            <p className="text-sm text-gray-400 mt-1">Check if patients have prescriptions in their data</p>
          </div>
        )}
      </div>
    )}

    {/* Walk-in Prescriptions Content */}
    {prescriptionSubTab === "walkin" && (
      <div>
        <h3 className="text-lg font-semibold mb-3">Walk-in Prescriptions</h3>
        {medicines && medicines.length > 0 ? (
          <div className="space-y-4">
            {medicines.map(prescription => (
              <div key={prescription._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-green-600">Patient: {prescription.patientName || "Walk-in Patient"}</h3>
                    <p className="text-sm text-gray-600">Phone: {prescription.patientPhone || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">{formatDate(prescription.createdAt)}</span>
                    <div className="mt-1">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Total: {prescription.charges} Rs
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  Dispensed by: <span className="font-medium">{prescription.PharmacyPerson}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-2">Medicines:</h4>
                  <ul className="space-y-1">
                    {prescription.medicines?.map((med, idx) => (
                      <li key={idx} className="text-sm">
                        • {med.medicineName} - Qty: {med.quantity} - Charges: {med.pharmacyCharges} Rs
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No walk-in prescriptions found</p>
          </div>
        )}
      </div>
    )}
  </div>
)}
        {/* {activeTab === "prescriptions" && (
          <div>
            <h2 className="text-xl font-bold mb-4">All Prescriptions ({stats.totalPrescriptions})</h2>
            
            <div className="mb-6">
              <div className="flex space-x-4 border-b">
                <button
                  onClick={() => setActiveTab("patient_prescriptions")}
                  className={`py-2 px-4 font-medium ${activeTab === "patient_prescriptions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                >
                  Patient Prescriptions ({patientPrescriptions.length})
                </button>
                <button
                  onClick={() => setActiveTab("walkin_prescriptions")}
                  className={`py-2 px-4 font-medium ${activeTab === "walkin_prescriptions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                >
                  Walk-in Prescriptions ({walkinPrescriptions.length})
                </button>
              </div>
            </div>

            {activeTab === "patient_prescriptions" && patientPrescriptions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Patient Prescriptions</h3>
                {patientPrescriptions.map((prescription, index) => (
                  <div key={`patient-${prescription._id}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-blue-600">Patient: {prescription.patientName}</h3>
                        <p className="text-sm text-gray-600">ID: {prescription.patientUniqueId} | Phone: {prescription.patientPhone}</p>
                        <p className="text-sm text-gray-600">Age: {prescription.patientAge} | Gender: {prescription.patientGender}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">{formatDate(prescription.prescribedDate)}</span>
                        <div className="mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-2">
                            Patient Prescription
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Total: {prescription.charges} Rs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Doctor:</span> {prescription.doctorName} 
                      {prescription.diagnosis && <span className="ml-4">Diagnosis: {prescription.diagnosis}</span>}
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Medicines Prescribed:</h4>
                        <span className="text-sm text-gray-600">
                          Dispensed by: {prescription.PharmacyPerson}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {prescription.medicines?.map((med, idx) => (
                          <li key={idx} className="text-sm bg-white p-2 rounded">
                            <div className="font-medium">{med.medicineName}</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mt-1">
                              {med.dosage && <div>Dosage: {med.dosage}</div>}
                              {med.quantity && <div>Quantity: {med.quantity}</div>}
                              {med.duration && <div>Duration: {med.duration}</div>}
                              {med.frequency && <div>Frequency: {med.frequency}</div>}
                              {med.timing && <div>Timing: {med.timing}</div>}
                              {med.notes && <div className="md:col-span-2">Notes: {med.notes}</div>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "walkin_prescriptions" && walkinPrescriptions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-3">Walk-in Prescriptions</h3>
                {walkinPrescriptions.map(prescription => (
                  <div key={prescription._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-green-600">Walk-in Patient: {prescription.patientName}</h3>
                        <p className="text-sm text-gray-600">Phone: {prescription.patientPhone || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">{formatDate(prescription.createdAt)}</span>
                        <div className="mt-1">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mr-2">
                            Walk-in Prescription
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Total: {prescription.charges} Rs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      Dispensed by: <span className="font-medium">{prescription.PharmacyPerson}</span>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-medium mb-2">Medicines:</h4>
                      <ul className="space-y-2">
                        {prescription.medicines?.map((med, idx) => (
                          <li key={idx} className="text-sm bg-white p-2 rounded">
                            <div className="font-medium">{med.medicineName}</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600 mt-1">
                              <div>Quantity: {med.quantity}</div>
                              <div>Charges: {med.pharmacyCharges} Rs</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(activeTab === "patient_prescriptions" && patientPrescriptions.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No patient prescriptions found</p>
              </div>
            )}

            {(activeTab === "walkin_prescriptions" && walkinPrescriptions.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No walk-in prescriptions found</p>
              </div>
            )}
          </div>
        )} */}

  
        {activeTab === "lab" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Laboratory Records ({labRecords?.records?.length || 0})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {labRecords?.records?.map(record => (
                    <tr key={record._id}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-sm">{record.patientName}</div>
                          <div className="text-xs text-gray-500">{record.patientUniqueId}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{record.testName}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {record.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${record.priority === "Urgent" || record.priority === "Emergency" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                          {record.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{formatDate(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "xray" && (
          <div>
            <h2 className="text-xl font-bold mb-4">X-Ray Reports ({stats.totalXrays})</h2>
            
            {/* Regular Patient X-Rays */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Patient X-Ray Reports ({xrayRecords?.length || 0})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {xrayRecords?.map(record => (
                      <tr key={record._id}>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-sm">{record.patientName}</div>
                            <div className="text-xs text-gray-500">Age: {record.age}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{record.testName}</td>
                        <td className="px-4 py-3 text-sm">{record.category}</td>
                        <td className="px-4 py-3 text-sm">{record.performedBy}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Walk-in X-Rays */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Walk-in X-Ray Reports ({walkinXrayData?.records?.length || 0})</h3>
              {walkinXrayData?.records?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age/Gender</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {walkinXrayData.records.map(record => (
                        <tr key={record._id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm">{record.patientName}</div>
                            <div className="text-xs text-gray-500">{record.patientUniqueId}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">{record.testName}</td>
                          <td className="px-4 py-3 text-sm">{record.age} / {record.gender}</td>
                          <td className="px-4 py-3 text-sm">{record.performedBy}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(record.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No walk-in X-ray records found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold mb-4">All Users ({allUsers?.length || 0})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUsers?.map(user => (
                <div key={user._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start mb-3">
                    <div className={`p-3 rounded-lg ${user.role === "Doctor" ? "bg-blue-100" : 
                                          user.role === "Admin" ? "bg-purple-100" : 
                                          user.role === "Reception" ? "bg-green-100" : 
                                          user.role === "Lab" ? "bg-orange-100" :
                                          user.role === "X-Ray" ? "bg-red-100" :
                                          "bg-gray-100"}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${user.role === "Doctor" ? "bg-blue-100 text-blue-800" : 
                                        user.role === "Admin" ? "bg-purple-100 text-purple-800" : 
                                        user.role === "Reception" ? "bg-green-100 text-green-800" :
                                        user.role === "Lab" ? "bg-orange-100 text-orange-800" :
                                        user.role === "X-Ray" ? "bg-red-100 text-red-800" :
                                        "bg-gray-100 text-gray-800"}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Phone: {user.phone}</p>
                    <p>Verified: {user.verified ? "✅ Yes" : "❌ No"}</p>
                    {user.licenseNumber && <p>License: {user.licenseNumber}</p>}
                    <p className="text-xs text-gray-500">Joined: {formatDate(user.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={getData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>
    </div>
  );
}

export default Admin;