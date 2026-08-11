import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import patientStore from '../../store/patientStore';
import userStore from '../../store/userStore';
import { 
  FileText, 
  User, 
  Plus, 
  Trash2, 
  Stethoscope, 
  Activity,
  Printer,
  Edit,
  X
} from 'lucide-react';

function RecommendTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientID, doctorID } = location.state || {};
  
  const { getPatientById, singlePatient, updatePatient } = patientStore();
  const { getUserById, singleUser } = userStore();
  
  const [diagnosis, setDiagnosis] = useState('');
  const [testRecommendation, setTestRecommendation] = useState({
    doctorId: doctorID,
    doctorName: '',
    specialist: '',
    licenseNumber: '',
    recommendedDate: new Date().toISOString(),
    diagnosis: '',
    tests: []
  });
  
  const [newTest, setNewTest] = useState({
    testName: '',
    category: '',
    priority: 'Normal',
    instructions: '',
    notes: '',
    status: 'Pending'
  });
  
  const [loading, setLoading] = useState(false);
  const [editingTestIndex, setEditingTestIndex] = useState(null);
  const [editingRecommendationId, setEditingRecommendationId] = useState(null);
  const [isNewRecommendation, setIsNewRecommendation] = useState(true);
  
  const testCategories = [
  'Blood Test',
  'Urine Test',
  'Hematology',
  'Biochemistry',
  'Microbiology',
  'Immunology',
  'Endocrinology',
  'Pathology',
  'Imaging',
  'Cardiology',
  'Neurology',
  'Blood Bank',          
  'Histopathology',     
  'Culture & Sensitivity',
  'Hormone Test',  
  'Genetic Test',
  'Other'
];

  
  // Priority options
  const priorityOptions = [
    { value: 'Normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
    { value: 'Urgent', label: 'Urgent', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' }
  ];
  
  const getpatient = async () => {
    await getPatientById(patientID);
  };

  const getdoctor = async () => {
    await getUserById(doctorID);
  };

  useEffect(() => {
    if (patientID && doctorID) {
      getpatient();
      getdoctor();
    } else {
      navigate('/doctor-dashboard');
    }
  }, [patientID, doctorID]);

  // Initialize recommendation data when doctor data is loaded
  useEffect(() => {
    if (singleUser) {
      setTestRecommendation(prev => ({
        ...prev,
        doctorId: doctorID,
        doctorName: singleUser.name || '',
        specialist: singleUser.SpecialistDoctor || '',
        licenseNumber: singleUser.licenseNumber || ''
      }));
    }
  }, [singleUser, doctorID]);

  // Load existing test recommendations if available
  useEffect(() => {
    if (singlePatient && singlePatient.recommendedTests && singlePatient.recommendedTests.length > 0) {
      // If we're not editing a specific recommendation, load the latest one
      if (isNewRecommendation && editingRecommendationId === null) {
        const latestRecommendation = singlePatient.recommendedTests[singlePatient.recommendedTests.length - 1];
        // Only load if we don't have any tests in current recommendation
        if (testRecommendation.tests.length === 0) {
          setTestRecommendation(latestRecommendation);
          setDiagnosis(latestRecommendation.diagnosis || '');
        }
      }
    }
  }, [singlePatient]);

  const handleAddTest = () => {
    if (!newTest.testName.trim() || !newTest.category.trim()) {
      alert('Please enter test name and category');
      return;
    }
    
    const testWithId = {
      ...newTest,
      id: Date.now() // Temporary ID for UI
    };
    
    const updatedTests = [...testRecommendation.tests, testWithId];
    setTestRecommendation({...testRecommendation, tests: updatedTests});
    
    // Reset form
    setNewTest({
      testName: '',
      category: '',
      priority: 'Normal',
      instructions: '',
      notes: '',
      status: 'Pending'
    });
  };

  const handleEditTest = (index) => {
    setEditingTestIndex(index);
    setNewTest(testRecommendation.tests[index]);
  };

  const handleUpdateTest = () => {
    if (editingTestIndex === null) return;
    
    const updatedTests = [...testRecommendation.tests];
    updatedTests[editingTestIndex] = { ...newTest, id: Date.now() };
    
    setTestRecommendation({...testRecommendation, tests: updatedTests});
    setEditingTestIndex(null);
    setNewTest({
      testName: '',
      category: '',
      priority: 'Normal',
      instructions: '',
      notes: '',
      status: 'Pending'
    });
  };
  

  const handleRemoveTest = (index) => {
    const updatedTests = testRecommendation.tests.filter((_, i) => i !== index);
    setTestRecommendation({...testRecommendation, tests: updatedTests});
  };

const handleSaveRecommendation = async () => {
  if (!singlePatient || testRecommendation.tests.length === 0) {
    alert('Please add at least one test');
    return;
  }
  
  setLoading(true);
  try {
    // Create the recommendation object
    const recommendationData = {
      ...testRecommendation,
      diagnosis: diagnosis,
      recommendedDate: new Date().toISOString()
    };

    // Remove temporary id from tests
    const cleanedTests = recommendationData.tests.map(({ id, ...rest }) => rest);
    recommendationData.tests = cleanedTests;

    // ===== DUPLICATE CHECK FOR NEW RECOMMENDATIONS =====
    // Only check for duplicates when creating NEW recommendations, not when editing
    if (!editingRecommendationId) {
      const hasExisting = singlePatient?.recommendedTests?.some(rec => 
        isDuplicateRecommendation(rec, recommendationData)
      );
      
      if (hasExisting) {
        const confirmSave = window.confirm(
          'A similar recommendation already exists. Do you want to save it anyway?'
        );
        if (!confirmSave) {
          setLoading(false);
          return;
        }
      }
    }
    // ====================================================

    // Get the latest patient data to ensure we have current recommendations
    const currentPatientData = await getPatientById(patientID);
    const existingRecommendations = currentPatientData?.recommendedTests || [];
    
    let updatedRecommendations;
    let isDuplicate = false;

    if (editingRecommendationId) {
      // UPDATE MODE: Check if we're editing the right recommendation
      const recommendationIndex = existingRecommendations.findIndex(
        rec => rec._id === editingRecommendationId
      );
      
      if (recommendationIndex !== -1) {
        // Check for duplicate by comparing all fields except _id and __v
        const existingRec = existingRecommendations[recommendationIndex];
        const isSameData = JSON.stringify({
          ...recommendationData,
          _id: undefined,
          __v: undefined,
          recommendedDate: undefined // Allow date to update
        }) === JSON.stringify({
          ...existingRec,
          _id: undefined,
          __v: undefined,
          recommendedDate: undefined
        });
        
        if (isSameData) {
          isDuplicate = true;
          alert('No changes detected. The recommendation is already saved.');
          setLoading(false);
          return;
        }
        
        // Found the recommendation to update
        updatedRecommendations = [...existingRecommendations];
        
        // Create updated recommendation while preserving the original _id
        const updatedRecommendation = {
          ...recommendationData,
          _id: editingRecommendationId,
          __v: existingRec.__v // Preserve version
        };
        
        updatedRecommendations[recommendationIndex] = updatedRecommendation;
      } else {
        // Not found, check if similar recommendation exists
        const similarRecIndex = existingRecommendations.findIndex(rec => 
          rec.doctorId === recommendationData.doctorId &&
          rec.diagnosis === recommendationData.diagnosis &&
          JSON.stringify(rec.tests) === JSON.stringify(recommendationData.tests)
        );
        
        if (similarRecIndex !== -1) {
          isDuplicate = true;
          alert('A similar recommendation already exists. You are now editing it.');
          // Load the existing similar recommendation
          setEditingRecommendationId(existingRecommendations[similarRecIndex]._id);
          setTestRecommendation(existingRecommendations[similarRecIndex]);
          setLoading(false);
          return;
        }
        
        // Add as new recommendation
        updatedRecommendations = [...existingRecommendations, recommendationData];
      }
    } else {
      // CREATE MODE: Check for duplicate before adding
      const duplicateCheck = existingRecommendations.find(rec => 
        rec.doctorId === recommendationData.doctorId &&
        rec.diagnosis === recommendationData.diagnosis &&
        JSON.stringify(rec.tests) === JSON.stringify(recommendationData.tests)
      );
      
      if (duplicateCheck) {
        isDuplicate = true;
        alert('This recommendation already exists. You are now editing it.');
        // Load the existing duplicate
        setEditingRecommendationId(duplicateCheck._id);
        setTestRecommendation(duplicateCheck);
        setLoading(false);
        return;
      }
      
      // Add new recommendation to the end
      updatedRecommendations = [...existingRecommendations, recommendationData];
    }

    if (!isDuplicate) {
      // Prepare update data - ONLY update recommendedTests
      const updatedData = {
        recommendedTests: updatedRecommendations
      };

      // Call updatePatient with patient ID and update data
      const success = await updatePatient(singlePatient._id, updatedData);
      
      if (success) {
        const action = editingRecommendationId ? 'updated' : 'saved';
        alert(`Test recommendations ${action} successfully!`);
        
        // Refresh patient data from server
        await getPatientById(patientID);
        
        // Reset to new recommendation mode
        resetToNewRecommendation();
        navigate('/recommendTest')
      } else {
        alert('Failed to save recommendations');
      }
    }
  } catch (error) {
    console.error('Error saving test recommendations:', error);
    alert(`Failed to save test recommendations: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

const isDuplicateRecommendation = (rec1, rec2) => {
  // Compare all relevant fields except IDs and dates
  const fieldsToCompare = ['doctorId', 'doctorName', 'specialist', 'diagnosis', 'tests'];
  
  return fieldsToCompare.every(field => {
    if (field === 'tests') {
      return JSON.stringify(rec1[field]) === JSON.stringify(rec2[field]);
    }
    return rec1[field] === rec2[field];
  });
};

const resetToNewRecommendation = () => {
  setTestRecommendation({
    doctorId: doctorID,
    doctorName: singleUser?.name || '',
    specialist: singleUser?.SpecialistDoctor || '',
    licenseNumber: singleUser?.licenseNumber || '',
    recommendedDate: new Date().toISOString(),
    diagnosis: '',
    tests: []
  });
  setDiagnosis('');
  setNewTest({
    testName: '',
    category: '',
    priority: 'Normal',
    instructions: '',
    notes: '',
    status: 'Pending'
  });
  setEditingTestIndex(null);
  setEditingRecommendationId(null);
  setIsNewRecommendation(true);
};

           



  const handleGenerateReport = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Test Recommendations - ${singlePatient?.name}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
              color: #333;
              background: #f8f9fa;
            }
            .report-container {
              max-width: 1000px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              padding: 40px 50px 30px;
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              color: white;
              border-radius: 12px;
              margin-bottom: 30px;
              box-shadow: 0 4px 15px rgba(5, 150, 105, 0.2);
            }
            .header h2 { 
              color: white; 
              margin: 0 0 10px 0;
              font-size: 32px;
              font-weight: 700;
            }
            .patient-info { 
              margin-bottom: 30px; 
              background: white; 
              padding: 30px; 
              border-radius: 12px; 
              border: 1px solid #e2e8f0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .test-table { 
              width: 100%; 
              border-collapse: separate;
              border-spacing: 0;
              margin: 20px 0;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              background: white;
            }
            .test-table thead {
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            }
            .test-table th, 
            .test-table td { 
              padding: 16px 20px; 
              text-align: left; 
              border-bottom: 1px solid #e2e8f0;
            }
            .test-table th {
              color: white;
              font-weight: 600;
              font-size: 14px;
            }
            .priority-badge {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .priority-normal { background: #d1fae5; color: #065f46; }
            .priority-urgent { background: #fef3c7; color: #92400e; }
            .priority-emergency { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h2>Laboratory Test Recommendations</h2>
              <div style="font-size: 16px; opacity: 0.9;">
                Date: ${new Date(testRecommendation.recommendedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div class="patient-info">
              <div style="color: #059669; border-bottom: 2px solid #a7f3d0; padding-bottom: 10px; margin-bottom: 20px; font-size: 18px; font-weight: 600;">
                Patient Information
              </div>
              <p><strong>Patient:</strong> <span style="color: #1e293b; font-weight: 600;">${singlePatient?.name}</span></p>
              <p><strong>Age:</strong> ${singlePatient?.age} | <strong>Gender:</strong> ${singlePatient?.gender}</p>
              <p><strong>Patient ID:</strong> ${singlePatient?.uniqueID}</p>
            </div>
            
            ${diagnosis ? `
              <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #bae6fd;">
                <h3 style="color: #0369a1; margin: 0 0 10px 0;">Clinical Diagnosis</h3>
                <p style="color: #0c4a6e;">${diagnosis}</p>
              </div>
            ` : ''}
            
            <table class="test-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${testRecommendation.tests.filter(test => !test.xRay).map(test => `
                  <tr>
                    <td><strong>${test.testName}</strong></td>
                    <td>${test.category}</td>
                    <td>
                      <span class="priority-badge priority-${test.priority.toLowerCase()}">
                        ${test.priority}
                      </span>
                    </td>
                    <td><small>${test.notes || '-'}</small></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 30px;">
              <div style="float: right; text-align: center;">
                <p style="border-top: 2px solid #059669; padding-top: 10px; width: 200px; margin: 0 auto 10px;"></p>
                <p><strong>Dr. ${testRecommendation.doctorName || 'Doctor'}</strong></p>
                <p>${testRecommendation.specialist || 'General Practitioner'}</p>
                <p>License: ${singleUser?.licenseNumber || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
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
              🖨️ Print Report
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
  };

  if (!singlePatient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
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
                <Activity className="w-8 h-8 text-emerald-600" />
                Laboratory Test Recommendations
               
              </h1>
             
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                           
              <button
                onClick={handleGenerateReport}
                disabled={testRecommendation.tests.length === 0}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              
              <button
                onClick={handleSaveRecommendation}
                disabled={loading || testRecommendation.tests.length === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingRecommendationId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    {editingRecommendationId ? 'Update' : 'Save'} Recommendations
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-50 p-4 rounded-lg">
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Doctor Information
              </h3>
              <div className="space-y-2">
                <InfoRow label="Doctor Name" value={singleUser?.name || 'Loading...'} />
                <InfoRow label="Specialization" value={singleUser?.SpecialistDoctor || 'Not specified'} />
                <InfoRow label="License No" value={singleUser?.licenseNumber || 'Not specified'} />
              </div>
            </div>
          </div>

          {/* Diagnosis Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Clinical Diagnosis & Reason for Tests
            </h3>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter clinical diagnosis and reason for recommending these tests..."
              rows="3"
            />
          </div>

          {/* Add Test Form */}
          <div className="bg-white border text-black border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              {editingTestIndex !== null ? 'Edit Test' : 'Add New Test'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name *
                </label>
                <input
                  type="text"
                  value={newTest.testName}
                  onChange={(e) => setNewTest({...newTest, testName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Complete Blood Count"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={newTest.category}
                  onChange={(e) => setNewTest({...newTest, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Category</option>
                  {testCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTest.priority}
                  onChange={(e) => setNewTest({...newTest, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions To Lab Attendant
                </label>
                <input
                  type="text"
                  value={newTest.instructions}
                  onChange={(e) => setNewTest({...newTest, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Fasting required"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newTest.status}
                  onChange={(e) => setNewTest({...newTest, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Pending">Pending</option>
                </select>
              </div> */}

              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes For Patient
                </label>
                <textarea
                  value={newTest.notes}
                  onChange={(e) => setNewTest({...newTest, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Additional notes or comments..."
                  rows="2"
                />
              </div>
            </div>

            <div className="flex gap-3">
              {editingTestIndex !== null ? (
                <>
                  <button
                    onClick={handleUpdateTest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Test
                  </button>
                  <button
                    onClick={() => {
                      setEditingTestIndex(null);
                      setNewTest({
                        testName: '',
                        category: '',
                        priority: 'Normal',
                        instructions: '',
                        notes: '',
                        status: 'Pending'
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel Edit
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddTest}
                  disabled={!newTest.testName.trim() || !newTest.category.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Test
                </button>
              )}
            </div>
          </div>

          {/* Tests List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Recommended Tests ({testRecommendation.tests.length})
                  {editingRecommendationId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                      ID: {editingRecommendationId.substring(0, 8)}...
                    </span>
                  )}
                </h3>
                {diagnosis && (
                  <div className="text-sm text-gray-700 bg-blue-50 px-3 py-1 rounded">
                    <span className="font-medium">Diagnosis:</span> {diagnosis}
                  </div>
                )}
              </div>
            </div>

            {testRecommendation.tests.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No tests recommended yet</p>
                <p className="text-gray-500 text-sm mt-1">Add tests using the form above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructions
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testRecommendation.tests.filter(test => !test.xRay).map((test, index) => (
                      <tr key={test.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {test.testName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{test.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                            test.priority === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {test.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{test.instructions || '-'}</div>
                        </td>
                        {/* <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            // test.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            test.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            test.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {test.status}
                          </span>
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {test.notes || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTest(index)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveTest(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

export default RecommendTest;
