// import React, { useState } from 'react';
// import patientStore from '../../store/patientStore';
// import labStore from '../../store/labStore';
// import { 
//   Search, User, FileText, CheckCircle, XCircle, 
//   FileCheck, Activity, FlaskConical, Plus,TestTube,
//    Trash2
// } from 'lucide-react';
// import { useLocation, useNavigate } from 'react-router-dom';

// function Lab() {
//   const { getPatientByUniqueId, singlePatient } = patientStore();
//   const { createLabRecord } = labStore();
//   const location = useLocation();
//   const { name } = location.state || {};
//   const [searchId, setSearchId] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [patientFound, setPatientFound] = useState(false);
//   const [selectedTest, setSelectedTest] = useState(null);
//   const [showAddResult, setShowAddResult] = useState(false);
//   const [testParameters, setTestParameters] = useState([
//     {
//       parameter: '',
//       value: '',
//       normalRange: '',
//       unit: '',
//       flag: 'Normal',
//       notes: ''
//     }
//   ]);
//   const [testResult, setTestResult] = useState({
//     testName: '',
//     category: '',
//     overallNotes: '',
//     attachment: null,
//     performedBy: name,
//     performedDate: new Date().toISOString().split('T')[0],
//     parameters: []
//   });
  
//   const navigate = useNavigate();


// const handleSearch = async () => {
//   if (!searchId.trim()) {
//     alert('Please enter Patient ID');
//     return;
//   }

//   setLoading(true);
  
//   try {

//     // Import axios directly for testing
//     const axiosInstance = (await import('../../lib/axios.js')).axiosInstance;
    
//     try {
//       const response = await axiosInstance.get(`/patient/unique/${searchId}`);
      
//       if (response.data.patient) {
//         setPatientFound(true);
//         // Manually set patient data
//         ({ singlePatient: response.data.patient });
        
//         // Process the patient data
//         const patient = response.data.patient;
//         const pendingTests = [];
//         if (patient.recommendedTests && patient.recommendedTests.length > 0) {
//           patient.recommendedTests.forEach(testGroup => {
//             if (testGroup.tests && testGroup.tests.length > 0) {
//               testGroup.tests.forEach(test => {
//                 if (test.status === 'Pending' && !test.xRay) {
//                   pendingTests.push({
//                     ...test,
//                     doctorId: testGroup.doctorId,
//                     doctorName: testGroup.doctorName,
//                     specialist: testGroup.specialist,
//                     diagnosis: testGroup.diagnosis,
//                     recommendedDate: testGroup.recommendedDate
//                   });
//                 }
//               });
//             }
//           });
//         }
        
//         if (pendingTests.length > 0) {
//           setSelectedTest(pendingTests[0]);
//           setTestResult({
//             testName: pendingTests[0].testName,
//             category: pendingTests[0].category,
//             overallNotes: '',
//             attachment: null,
//             performedBy: name,
//             performedDate: new Date().toISOString().split('T')[0],
//             parameters: []
//           });
//           setTestParameters([{
//             parameter: pendingTests[0].testName,
//             value: '',
//             normalRange: '',
//             unit: '',
//             flag: 'Normal',
//             notes: ''
//           }]);
//         }
        
//         return; // Exit if direct API worked
//       }
//     } catch (apiError) {
//       console.log('Direct API error:', apiError);
//     }
    
//     const patient = await getPatientByUniqueId(searchId);
//     console.log('Store function returned:', patient);
    
//     if (patient) {
//       setPatientFound(true);
//     } else {
//       alert('Patient not found with this ID');
//     }
    
//   } catch (error) {
//     alert(`Error: ${error.message || 'Failed to search patient'}`);
//   } finally {
//     setLoading(false);
//   }
// };
  
//   const handleAddParameter = () => {
//     setTestParameters([...testParameters, {
//       parameter: '',
//       value: '',
//       normalRange: '',
//       unit: '',
//       flag: 'Normal',
//       notes: ''
//     }]);
//   };

//   const handleRemoveParameter = (index) => {
//     if (testParameters.length > 1) {
//       const updatedParameters = [...testParameters];
//       updatedParameters.splice(index, 1);
//       setTestParameters(updatedParameters);
//     }
//   };

//   const handleParameterChange = (index, field, value) => {
//     const updatedParameters = [...testParameters];
//     updatedParameters[index][field] = value;
//     setTestParameters(updatedParameters);
//   };

// const handleAddResult = async () => {
//   // Detailed validation
//   const validationErrors = [];
  
//   // Check each parameter
//   testParameters.forEach((param, index) => {
//     if (!param.parameter?.trim()) {
//       validationErrors.push(`Parameter ${index + 1}: Parameter name is required`);
//     }
//     if (!param.value?.trim()) {
//       validationErrors.push(`Parameter ${index + 1}: Value is required`);
//     }
//   });
  
//   if (validationErrors.length > 0) {
//     alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
//     return;
//   }

//   if (!selectedTest) {
//     alert('No test selected');
//     return;
//   }

//   // Validate required fields for backend
//   if (!testResult.testName?.trim() && !selectedTest.testName?.trim()) {
//     alert('Test name is required');
//     return;
//   }

//   if (!testResult.category?.trim() && !selectedTest.category?.trim()) {
//     alert('Category is required');
//     return;
//   }

//   setLoading(true);
//   try {
//     // Prepare parameters array with proper structure
//     const processedParameters = testParameters.map(param => ({
//       parameter: param.parameter.trim(),
//       value: param.value.trim(),
//       unit: param.unit?.trim() || '',
//       normalRange: param.normalRange?.trim() || '',
//       flag: param.flag || 'Normal',
//       notes: param.notes?.trim() || ''
//     }));

    
//     // Create lab record with parameters array
//     const labRecordData = {
//     patientId: singlePatient._id,
//     patientName: singlePatient.name,
//     patientUniqueId: singlePatient.uniqueID,
//     age: singlePatient.age,
//     gender: singlePatient.gender,
//     doctorId: selectedTest.doctorId,
//     doctorName: selectedTest.doctorName,
//     testName: testResult.testName || selectedTest.testName,
//     category: testResult.category || selectedTest.category,
//     parameters: processedParameters,
//     overallNotes: testResult.overallNotes?.trim() || '',
//     performedBy: name || 'Lab Technician', // Make sure this has value
//     performedDate: testResult.performedDate,
//     status: 'Completed',
//     priority: selectedTest.priority || 'Routine',
//     instructions: selectedTest.instructions || '',
//     diagnosis: selectedTest.diagnosis || ''
//   };

  
//   const result = await createLabRecord(labRecordData);
//     if (result && result.success) {
//       alert('Test result saved successfully!');
//       setShowAddResult(false);
      
//       // Refresh patient data
//       await getPatientByUniqueId(searchId);
      
//       setSelectedTest(null);
//       setTestResult({
//         testName: '',
//         category: '',
//         overallNotes: '',
//         attachment: null,
//         performedBy: name,
//         performedDate: new Date().toISOString().split('T')[0],
//         parameters: []
//       });
//       setTestParameters([{
//         parameter: '',
//         value: '',
//         normalRange: '',
//         unit: '',
//         flag: 'Normal',
//         notes: ''
//       }]);
//     } else {
//       alert(`Failed to save test result: ${result.error || 'Unknown error'}`);
//     }
//   } catch (error) {
//     console.error('Error saving test result:', error);
//     alert('Error saving test result: ' + (error.message || 'Unknown error'));
//   } finally {
//     setLoading(false);
//   }
// };



//   const getAllPatientTests = () => {
//     const allTests = [];
//     if (singlePatient && singlePatient.recommendedTests) {
//       singlePatient.recommendedTests.forEach(testGroup => {
//         if (testGroup.tests && testGroup.tests.length > 0) {
//           testGroup.tests.filter(test => !test.xRay).forEach(test => {
//             allTests.push({
//               ...test,
//               doctorId: testGroup.doctorId,
//               doctorName: testGroup.doctorName,
//               specialist: testGroup.specialist,
//               diagnosis: testGroup.diagnosis,
//               recommendedDate: testGroup.recommendedDate
//             });
//           });
//         }
//       });
//     }
//     return allTests;
//   };

//   const allTests = getAllPatientTests();

//   return (
//     <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
//                 <FlaskConical className="w-8 h-8 text-blue-600" />
//                 Laboratory Management System
//               </h1>
//               <p className="text-gray-600 mt-1">Search patient by ID to add test results</p>
//             </div>
            
//             <div className="flex gap-3 mt-4 md:mt-0">
//               <button 
//                 onClick={() => navigate('/labTest')}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
//               >
//                 <FileText className="w-4 h-4" />
//                 All Lab Records
//               </button>
             
             
//             </div>
//           </div>

//           {/* Lab Statistics */}
         

//           {/* Search Section */}
//           <div className="bg-blue-50 p-6 rounded-lg mb-8">
//             <div className="flex flex-col md:flex-row gap-4 items-end">
//               <div className="flex-1">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Enter Patient ID
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     value={searchId}
//                     onChange={(e) => setSearchId(e.target.value.toUpperCase())}
//                     onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                     className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
//                     placeholder="HMS-260113-0003"
//                   />
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 </div>
//               </div>
//               <button
//                 onClick={handleSearch}
//                 disabled={loading}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Search className="w-5 h-5" />
//                     Search Patient
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Add Result Modal with Multiple Parameters */}
//           {showAddResult && selectedTest && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//               <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                   <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                       <FileCheck className="w-6 h-6 text-blue-600" />
//                       Add Test Results
//                     </h2>
//                     <button
//                       onClick={() => setShowAddResult(false)}
//                       className="p-2 hover:bg-gray-100 rounded-full"
//                     >
//                       <XCircle className="w-5 h-5 text-gray-500" />
//                     </button>
//                   </div>

//                   {/* Test Information */}
//                   <div className="mb-6 p-4 bg-blue-50 rounded-lg">
//                     <h3 className="font-semibold text-gray-900 mb-3">Test Information</h3>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <span className="text-sm text-gray-600">Test Name:</span>
//                         <p className="font-medium">{selectedTest.testName}</p>
//                       </div>
//                       <div>
//                         <span className="text-sm text-gray-600">Category:</span>
//                         <p className="font-medium">{selectedTest.category}</p>
//                       </div>
//                       <div>
//                         <span className="text-sm text-gray-600">Doctor:</span>
//                         <p className="font-medium">{selectedTest.doctorName}</p>
//                       </div>
//                       <div>
//                         <span className="text-sm text-gray-600">Priority:</span>
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           selectedTest.priority === 'Urgent' 
//                             ? 'bg-red-100 text-red-800' 
//                             : 'bg-blue-100 text-blue-800'
//                         }`}>
//                           {selectedTest.priority}
//                         </span>
//                       </div>
//                     </div>
//                     {selectedTest.instructions && (
//                       <div className="mt-3">
//                         <span className="text-sm text-gray-600">Instructions:</span>
//                         <p className="text-sm mt-1">{selectedTest.instructions}</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Test Parameters Form */}
//                   <div className="space-y-4 mb-6">
//                     <div className="flex justify-between items-center">
//                       <h3 className="font-semibold text-gray-900">Test Parameters</h3>
//                       <button
//                         onClick={handleAddParameter}
//                         type="button"
//                         className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
//                       >
//                         <Plus className="w-3 h-3" />
//                         Add Parameter
//                       </button>
//                     </div>
                    
//                     {testParameters.map((param, index) => (
//                       <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
//                         <div className="flex justify-between items-center mb-3">
//                           <h4 className="font-medium text-gray-900">Parameter {index + 1}</h4>
//                           {testParameters.length > 1 && (
//                             <button
//                               onClick={() => handleRemoveParameter(index)}
//                               type="button"
//                               className="p-1 text-red-600 hover:text-red-800"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           )}
//                         </div>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">
//                               Parameter Name *
//                             </label>
//                             <input
//                               type="text"
//                               value={param.parameter}
//                               onChange={(e) => handleParameterChange(index, 'parameter', e.target.value)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                               placeholder="e.g., Blood Glucose"
//                               required
//                             />
//                           </div>
                          
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">
//                               Value *
//                             </label>
//                             <input
//                               type="text"
//                               value={param.value}
//                               onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                               placeholder="e.g., 120"
//                               required
//                             />
//                           </div>
                          
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">
//                               Normal Range
//                             </label>
//                             <input
//                               type="text"
//                               value={param.normalRange}
//                               onChange={(e) => handleParameterChange(index, 'normalRange', e.target.value)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                               placeholder="e.g., 70-110"
//                             />
//                           </div>
                          
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">
//                               Unit
//                             </label>
//                             <input
//                               type="text"
//                               value={param.unit}
//                               onChange={(e) => handleParameterChange(index, 'unit', e.target.value)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                               placeholder="e.g., mg/dL"
//                             />
//                           </div>
                          
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">
//                               Flag
//                             </label>
//                             <select
//                               value={param.flag}
//                               onChange={(e) => handleParameterChange(index, 'flag', e.target.value)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                             >
//                               <option value="Normal">Normal</option>
//                               <option value="High">High</option>
//                               <option value="Low">Low</option>
//                               <option value="Critical">Critical</option>
//                             </select>
//                           </div>
                          
//                           <div className="md:col-span-3">
//                             <label className="block text-xs font-medium text-gray-700 mb-1">
//                               Notes
//                             </label>
//                             <input
//                               type="text"
//                               value={param.notes}
//                               onChange={(e) => handleParameterChange(index, 'notes', e.target.value)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                               placeholder="Additional notes for this parameter"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Overall Test Information */}
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Performed Date
//                         </label>
//                         <input
//                           type="date"
//                           value={testResult.performedDate}
//                           onChange={(e) => setTestResult({...testResult, performedDate: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Performed By
//                         </label>
//                         <input
//                           type="text"
//                           value={testResult.performedBy}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Charges Details
//                       </label>
//                       <textarea
//                         value={testResult.overallNotes}
//                         onChange={(e) => setTestResult({...testResult, overallNotes: e.target.value})}
//                         rows="3"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="Charges Details..."
//                       />
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
//                     <button
//                       onClick={() => setShowAddResult(false)}
//                       className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleAddResult}
//                       disabled={loading}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                           Saving...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle className="w-4 h-4" />
//                           Save All Results
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {patientFound && singlePatient && (
//             <>
//               {/* Patient Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                 <div className="bg-blue-50 p-5 rounded-lg">
//                   <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                     <User className="w-5 h-5 text-blue-600" />
//                     Patient Information
//                   </h3>
//                   <div className="space-y-2">
//                     <InfoRow label="Name" value={singlePatient.name} />
//                     <InfoRow label="Age" value={singlePatient.age} />
//                     <InfoRow label="Gender" value={singlePatient.gender} />
//                     <InfoRow label="Patient ID" value={singlePatient.uniqueID} />
//                     <InfoRow label="Blood Group" value={singlePatient.bloodGroup || 'Not specified'} />
//                   </div>
//                 </div>

//                 <div className="bg-emerald-50 p-5 rounded-lg">
//                   <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                     <Activity className="w-5 h-5 text-emerald-600" />
//                     Test Statistics
//                   </h3>
//                   <div className="space-y-2">
//                     <InfoRow 
//                       label="Total Tests" 
//                       value={allTests.length || 0} 
//                     />
//                     <InfoRow 
//                       label="Pending Tests" 
//                       value={
//                         allTests.filter(t => t.status === 'Pending').length || 0
//                       } 
//                     />
//                     <InfoRow 
//                       label="Completed Tests" 
//                       value={
//                         allTests.filter(t => t.status === 'Completed').length || 0
//                       } 
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Patient Tests Table */}
//               {allTests.length > 0 && (
//                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
//                   <div className="p-6 border-b border-gray-200 bg-gray-50">
//                     <h3 className="font-semibold text-gray-900 flex items-center gap-2">
//                       <FileText className="w-5 h-5 text-blue-600" />
//                       Patient Tests
//                       <span className="text-sm font-normal text-gray-500">
//                         ({allTests.length} tests)
//                       </span>
//                     </h3>
//                   </div>

//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                             Test Name
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                             Category
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                             Doctor
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                             Status
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                             Date
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                             Parameters
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {allTests.filter(test => !test.xRay).map((test, index) => {
//                           const parameters = test.parameters || [];
//                           return (
//                             <tr key={test._id || index} className="hover:bg-gray-50">
//                               <td className="px-6 py-4">
//                                 <div className="flex items-center gap-2">
//                                   <TestTube className="w-4 h-4 text-blue-500" />
//                                   <div>
//                                     <div className="text-sm font-medium text-gray-900">
//                                       {test.testName}
//                                     </div>
//                                     <div className="text-xs text-gray-500 mt-1">
//                                       {test.category}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900">{test.category}</div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900">{test.doctorName}</div>
//                                 <div className="text-xs text-gray-500">{test.specialist}</div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                   test.status === 'Completed'
//                                     ? 'bg-green-100 text-green-800'
//                                     : 'bg-yellow-100 text-yellow-800'
//                                 }`}>
//                                   {test.status}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900">
//                                   {test.recommendedDate ? new Date(test.recommendedDate).toLocaleDateString() : 'N/A'}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900">
//                                   {parameters.length > 0 ? 
//                                     `${parameters.length} parameter(s)` : 
//                                     test.result ? '1 result' : 'No results'
//                                   }
//                                 </div>
//                                 {parameters.length > 0 && (
//                                   <div className="text-xs text-gray-500 mt-1">
//                                     {parameters.map(p => p.parameter).join(', ')}
//                                   </div>
//                                 )}
//                               </td>
//                               <td className="px-6 py-4">
//                                 {test.status === 'Pending' ? (
//                                   <button
//                                     onClick={() => {
//                                       setSelectedTest(test);
//                                       setTestResult({
//                                         testName: test.testName,
//                                         category: test.category,
//                                         overallNotes: '',
//                                         attachment: null,
//                                         performedBy: name,
//                                         performedDate: new Date().toISOString().split('T')[0],
//                                         parameters: []
//                                       });
//                                       setTestParameters([{
//                                         parameter: test.testName,
//                                         value: '',
//                                         normalRange: '',
//                                         unit: '',
//                                         flag: 'Normal',
//                                         notes: ''
//                                       }]);
//                                       setShowAddResult(true);
//                                     }}
//                                     className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
//                                   >
//                                     <Plus className="w-3 h-3" />
//                                     Add Results
//                                   </button>
//                                 ) : (
//                                   <div className="flex gap-2">
                                  
//                                     {(test.result || test.parameters?.length > 0) && (
//                                       <button
//                                         onClick={() => {
//                                           setSelectedTest(test);
//                                           if (test.parameters?.length > 0) {
//                                             alert(`Test has ${test.parameters.length} parameters:\n\n${
//                                               test.parameters.map((p, i) => 
//                                                 `${i+1}. ${p.parameter}: ${p.value} ${p.unit || ''}`
//                                               ).join('\n')
//                                             }`);
//                                           } else {
//                                             alert(`Test Result: ${test.result}`);
//                                           }
//                                         }}
//                                         className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 text-sm"
//                                       >
//                                         <FileText className="w-3 h-3" />
//                                         View
//                                       </button>
//                                     )}
//                                   </div>
//                                 )}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

           
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Helper component
// const InfoRow = ({ label, value }) => (
//   <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
//     <span className="text-sm text-gray-600">{label}:</span>
//     <span className="text-sm font-medium text-gray-900">{value}</span>
//   </div>
// );

// export default Lab;








import React, { useState } from 'react';
import patientStore from '../../store/patientStore';
import labStore from '../../store/labStore';
import { 
  Search, User, FileText, CheckCircle, XCircle, 
  FileCheck, Activity, FlaskConical, Plus, TestTube,
  Trash2, RefreshCw
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

function Lab() {
  const { getPatientByUniqueId, singlePatient } = patientStore();
  const { createLabRecord } = labStore();
  const location = useLocation();
  const { name } = location.state || {};
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientFound, setPatientFound] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showAddResult, setShowAddResult] = useState(false);
  const [testParameters, setTestParameters] = useState([
    {
      parameter: '',
      value: '',
      normalRange: '',
      unit: '',
      flag: 'Normal',
      notes: ''
    }
  ]);
  const [testResult, setTestResult] = useState({
    testName: '',
    category: '',
    overallNotes: '',
    attachment: null,
    performedBy: name,
    performedDate: new Date().toISOString().split('T')[0],
    parameters: []
  });
  
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchId.trim()) {
      alert('Please enter Patient ID');
      return;
    }

    setLoading(true);
    setPatientFound(false);
    setSelectedTest(null);
    
    try {
      // Clear any existing patient data first
      patientStore.setState({ singlePatient: null });
      
      // Use the store function to get patient
      const patientData = await getPatientByUniqueId(searchId);
      
      console.log('Patient data from store:', patientData);
      
      // Check if patient was found
      if (!patientData || !patientData._id) {
        alert('Patient not found with this ID');
        return;
      }
      
      setPatientFound(true);
      
      // Process the patient data from store
      const patient = patientStore.getState().singlePatient;
      
      console.log('Patient from store state:', patient);
      
      if (!patient) {
        alert('Patient data not loaded properly');
        return;
      }
      
      const pendingTests = [];
      if (patient.recommendedTests && patient.recommendedTests.length > 0) {
        patient.recommendedTests.forEach(testGroup => {
          if (testGroup.tests && testGroup.tests.length > 0) {
            testGroup.tests.forEach(test => {
              if (test.status === 'Pending' && !test.xRay) {
                pendingTests.push({
                  ...test,
                  doctorId: testGroup.doctorId,
                  doctorName: testGroup.doctorName,
                  specialist: testGroup.specialist,
                  diagnosis: testGroup.diagnosis,
                  recommendedDate: testGroup.recommendedDate
                });
              }
            });
          }
        });
      }
      
      if (pendingTests.length > 0) {
        setSelectedTest(pendingTests[0]);
        setTestResult({
          testName: pendingTests[0].testName,
          category: pendingTests[0].category,
          overallNotes: '',
          attachment: null,
          performedBy: name,
          performedDate: new Date().toISOString().split('T')[0],
          parameters: []
        });
        setTestParameters([{
          parameter: pendingTests[0].testName,
          value: '',
          normalRange: '',
          unit: '',
          flag: 'Normal',
          notes: ''
        }]);
      } else {
        console.log('No pending tests found for patient');
      }
      
    } catch (error) {
      console.error('Error searching patient:', error);
      alert(`Error: ${error.message || 'Failed to search patient'}`);
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check current state
  const debugState = () => {
    console.log('Current store state:', patientStore.getState());
    console.log('Patient found:', patientFound);
    console.log('Single patient:', singlePatient);
  };

  const handleAddParameter = () => {
    setTestParameters([...testParameters, {
      parameter: '',
      value: '',
      normalRange: '',
      unit: '',
      flag: 'Normal',
      notes: ''
    }]);
  };

  const handleRemoveParameter = (index) => {
    if (testParameters.length > 1) {
      const updatedParameters = [...testParameters];
      updatedParameters.splice(index, 1);
      setTestParameters(updatedParameters);
    }
  };

  const handleParameterChange = (index, field, value) => {
    const updatedParameters = [...testParameters];
    updatedParameters[index][field] = value;
    setTestParameters(updatedParameters);
  };

  const handleAddResult = async () => {
    // Detailed validation
    const validationErrors = [];
    
    // Check each parameter
    testParameters.forEach((param, index) => {
      if (!param.parameter?.trim()) {
        validationErrors.push(`Parameter ${index + 1}: Parameter name is required`);
      }
      if (!param.value?.trim()) {
        validationErrors.push(`Parameter ${index + 1}: Value is required`);
      }
    });
    
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
      return;
    }

    if (!selectedTest) {
      alert('No test selected');
      return;
    }

    // Validate required fields for backend
    if (!testResult.testName?.trim() && !selectedTest.testName?.trim()) {
      alert('Test name is required');
      return;
    }

    if (!testResult.category?.trim() && !selectedTest.category?.trim()) {
      alert('Category is required');
      return;
    }

    setLoading(true);
    try {
      // Prepare parameters array with proper structure
      const processedParameters = testParameters.map(param => ({
        parameter: param.parameter.trim(),
        value: param.value.trim(),
        unit: param.unit?.trim() || '',
        normalRange: param.normalRange?.trim() || '',
        flag: param.flag || 'Normal',
        notes: param.notes?.trim() || ''
      }));

      // Check if singlePatient exists
      if (!singlePatient || !singlePatient._id) {
        alert('Patient data not available. Please search patient again.');
        return;
      }
      
      // Create lab record with parameters array
      const labRecordData = {
        patientId: singlePatient._id,
        patientName: singlePatient.name,
        patientUniqueId: singlePatient.uniqueID,
        age: singlePatient.age,
        gender: singlePatient.gender,
        doctorId: selectedTest.doctorId,
        doctorName: selectedTest.doctorName,
        testName: testResult.testName || selectedTest.testName,
        category: testResult.category || selectedTest.category,
        parameters: processedParameters,
        overallNotes: testResult.overallNotes?.trim() || '',
        performedBy: name || 'Lab Technician',
        performedDate: testResult.performedDate,
        status: 'Completed',
        priority: selectedTest.priority || 'Routine',
        instructions: selectedTest.instructions || '',
        diagnosis: selectedTest.diagnosis || ''
      };

      console.log('Sending lab record data:', labRecordData);
      
      const result = await createLabRecord(labRecordData);
      
      if (result && result.success) {
        alert('Test result saved successfully!');
        setShowAddResult(false);
        
        // Refresh patient data
        await getPatientByUniqueId(searchId);
        
        setSelectedTest(null);
        setTestResult({
          testName: '',
          category: '',
          overallNotes: '',
          attachment: null,
          performedBy: name,
          performedDate: new Date().toISOString().split('T')[0],
          parameters: []
        });
        setTestParameters([{
          parameter: '',
          value: '',
          normalRange: '',
          unit: '',
          flag: 'Normal',
          notes: ''
        }]);
      } else {
        alert(`Failed to save test result: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      alert('Error saving test result: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getAllPatientTests = () => {
    const allTests = [];
    
    if (singlePatient && singlePatient.recommendedTests) {
      singlePatient.recommendedTests.forEach(testGroup => {
        if (testGroup.tests && testGroup.tests.length > 0) {
          testGroup.tests.filter(test => !test.xRay).forEach(test => {
            allTests.push({
              ...test,
              doctorId: testGroup.doctorId,
              doctorName: testGroup.doctorName,
              specialist: testGroup.specialist,
              diagnosis: testGroup.diagnosis,
              recommendedDate: testGroup.recommendedDate
            });
          });
        }
      });
    }
    
    return allTests;
  };

  const allTests = getAllPatientTests();

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FlaskConical className="w-8 h-8 text-blue-600" />
                Laboratory Management System
              </h1>
              <p className="text-gray-600 mt-1">Search patient by ID to add test results</p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <button 
                onClick={() => navigate('/labTest')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                All Lab Records
              </button>
              
              {/* Debug button (remove in production) */}
              <button 
                onClick={debugState}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Debug State
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
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
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
                    placeholder="HMS-260113-0003"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Enter patient ID exactly as shown in their record
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Patient Found Section */}
          {patientFound && singlePatient && (
            <>
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-5 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
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

                <div className="bg-emerald-50 p-5 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Test Statistics
                  </h3>
                  <div className="space-y-2">
                    <InfoRow 
                      label="Total Tests" 
                      value={allTests.length || 0} 
                    />
                    <InfoRow 
                      label="Pending Tests" 
                      value={
                        allTests.filter(t => t.status === 'Pending').length || 0
                      } 
                    />
                    <InfoRow 
                      label="Completed Tests" 
                      value={
                        allTests.filter(t => t.status === 'Completed').length || 0
                      } 
                    />
                  </div>
                </div>
              </div>

              {/* Patient Tests Table */}
              {allTests.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Patient Tests
                      <span className="text-sm font-normal text-gray-500">
                        ({allTests.length} tests)
                      </span>
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Test Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Doctor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allTests.filter(test => !test.xRay).map((test, index) => (
                          <tr key={test._id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <TestTube className="w-4 h-4 text-blue-500" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {test.testName}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {test.category}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{test.category}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{test.doctorName}</div>
                              <div className="text-xs text-gray-500">{test.specialist}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                test.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {test.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {test.recommendedDate ? new Date(test.recommendedDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {test.status === 'Pending' ? (
                                <button
                                  onClick={() => {
                                    setSelectedTest(test);
                                    setTestResult({
                                      testName: test.testName,
                                      category: test.category,
                                      overallNotes: '',
                                      attachment: null,
                                      performedBy: name,
                                      performedDate: new Date().toISOString().split('T')[0],
                                      parameters: []
                                    });
                                    setTestParameters([{
                                      parameter: test.testName,
                                      value: '',
                                      normalRange: '',
                                      unit: '',
                                      flag: 'Normal',
                                      notes: ''
                                    }]);
                                    setShowAddResult(true);
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add Results
                                </button>
                              ) : (
                                <div className="flex gap-2">
                                  {(test.result || test.parameters?.length > 0) && (
                                    <button
                                      onClick={() => {
                                        if (test.parameters?.length > 0) {
                                          alert(`Test has ${test.parameters.length} parameters:\n\n${
                                            test.parameters.map((p, i) => 
                                              `${i+1}. ${p.parameter}: ${p.value} ${p.unit || ''}`
                                            ).join('\n')
                                          }`);
                                        } else {
                                          alert(`Test Result: ${test.result}`);
                                        }
                                      }}
                                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 text-sm"
                                    >
                                      <FileText className="w-3 h-3" />
                                      View
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <TestTube className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-700">No tests found for this patient</p>
                  <p className="text-sm text-gray-500 mt-1">The patient has no lab tests in their record</p>
                </div>
              )}
            </>
          )}

   

          {/* Add Result Modal with Multiple Parameters */}
          {showAddResult && selectedTest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FileCheck className="w-6 h-6 text-blue-600" />
                      Add Test Results
                    </h2>
                    <button
                      onClick={() => setShowAddResult(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <XCircle className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Test Information */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Test Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Test Name:</span>
                        <p className="font-medium">{selectedTest.testName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Category:</span>
                        <p className="font-medium">{selectedTest.category}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Doctor:</span>
                        <p className="font-medium">{selectedTest.doctorName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Priority:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedTest.priority === 'Urgent' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedTest.priority}
                        </span>
                      </div>
                    </div>
                    {selectedTest.instructions && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-600">Instructions:</span>
                        <p className="text-sm mt-1">{selectedTest.instructions}</p>
                      </div>
                    )}
                  </div>

                  {/* Test Parameters Form */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Test Parameters</h3>
                      <button
                        onClick={handleAddParameter}
                        type="button"
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        Add Parameter
                      </button>
                    </div>
                    
                    {testParameters.map((param, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Parameter {index + 1}</h4>
                          {testParameters.length > 1 && (
                            <button
                              onClick={() => handleRemoveParameter(index)}
                              type="button"
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Parameter Name *
                            </label>
                            <input
                              type="text"
                              value={param.parameter}
                              onChange={(e) => handleParameterChange(index, 'parameter', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="e.g., Blood Glucose"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Value *
                            </label>
                            <input
                              type="text"
                              value={param.value}
                              onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="e.g., 120"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Normal Range
                            </label>
                            <input
                              type="text"
                              value={param.normalRange}
                              onChange={(e) => handleParameterChange(index, 'normalRange', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="e.g., 70-110"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={param.unit}
                              onChange={(e) => handleParameterChange(index, 'unit', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="e.g., mg/dL"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Flag
                            </label>
                            <select
                              value={param.flag}
                              onChange={(e) => handleParameterChange(index, 'flag', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="Normal">Normal</option>
                              <option value="High">High</option>
                              <option value="Low">Low</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={param.notes}
                              onChange={(e) => handleParameterChange(index, 'notes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Additional notes for this parameter"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Test Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Performed Date
                        </label>
                        <input
                          type="date"
                          value={testResult.performedDate}
                          onChange={(e) => setTestResult({...testResult, performedDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Performed By
                        </label>
                        <input
                          type="text"
                          value={testResult.performedBy}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overall Notes
                      </label>
                      <textarea
                        value={testResult.overallNotes}
                        onChange={(e) => setTestResult({...testResult, overallNotes: e.target.value})}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Overall notes for this test..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowAddResult(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddResult}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Save All Results
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
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

export default Lab;