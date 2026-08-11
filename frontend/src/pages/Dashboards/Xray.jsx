import React, { useState } from 'react';
import patientStore from '../../store/patientStore';
import xrayStore from '../../store/xrayStore';
import { 
  Search, User, FileText, CheckCircle, XCircle, 
  FileCheck, Activity, Image, Camera, Clock, AlertCircle, 
  Plus, Upload, Trash2, Eye,
  UserPlus
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

function Xray() {
  const { getPatientByUniqueId, singlePatient } = patientStore();
  const { createXrayRecord } = xrayStore(); // Changed from createLabRecord to createXrayRecord
  const location = useLocation();
  const { name } = location.state || {};
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientFound, setPatientFound] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showAddResult, setShowAddResult] = useState(false);
  const [xrayRecords, setXrayRecords] = useState([
  {
    file: null, // Changed from image to file
    preview: null, // For displaying preview
    note: ''
  }
  ]);
  const [xrayResult, setXrayResult] = useState({
    testName: '',
    category: '',
    overallNotes: '',
    performedBy: name,
    performedDate: new Date().toISOString().split('T')[0],
    records: []
  });
  const [previewImage, setPreviewImage] = useState(null);
  
  const navigate = useNavigate();


const handleSearch = async () => {
  if (!searchId.trim()) {
    alert('Please enter Patient ID');
    return;
  }
  
  setLoading(true);
  setPatientFound(false); // Reset state
  setSelectedTest(null);
  setXrayRecords([{
    file: null,
    preview: null,
    note: ''
  }]);
  setXrayResult({
    testName: '',
    category: '',
    overallNotes: '',
    performedBy: name,
    performedDate: new Date().toISOString().split('T')[0],
    records: []
  });
  
  try {
    // Clear previous patient data
    ({ singlePatient: null });
    
    // Directly call and wait for the patient data
    const patient = await getPatientByUniqueId(searchId);
    
    // Check if patient was actually returned
    if (patient) {
      setPatientFound(true);
      
      // Check for pending X-ray tests
      const pendingTests = [];
      if (patient.recommendedTests && patient.recommendedTests.length > 0) {
        patient.recommendedTests.forEach(testGroup => {
          if (testGroup.tests && testGroup.tests.length > 0) {
            testGroup.tests.forEach(test => {
              if (test.xRay === true && test.status === 'Pending') {
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
        setXrayResult({
          testName: pendingTests[0].testName,
          category: pendingTests[0].category,
          overallNotes: '',
          performedBy: name,
          performedDate: new Date().toISOString().split('T')[0],
          records: []
        });
        setXrayRecords([{
          file: null,
          preview: null,
          note: ''
        }]);
      } else {
        setSelectedTest(null);
      }
    } else {
      alert('Patient not found with this ID');
    }
  } catch (error) {
    alert(`Error searching patient: ${error.message || 'Unknown error'}`);
    setPatientFound(false);
  } finally {
    setLoading(false);
  }
};


  const handleAddRecord = () => {
    setXrayRecords([...xrayRecords, {
      image: null,
      note: ''
    }]);
  };

  const handleRemoveRecord = (index) => {
    if (xrayRecords.length > 1) {
      const updatedRecords = [...xrayRecords];
      updatedRecords.splice(index, 1);
      setXrayRecords(updatedRecords);
    }
  };

const handleImageUpload = (index, file) => {
  if (!file) return;
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload only image files (JPEG, PNG, BMP)');
    return;
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('Image size should be less than 10MB');
    return;
  }
  
  const updatedRecords = [...xrayRecords];
  updatedRecords[index] = {
    ...updatedRecords[index],
    file: file, // Store the file object
    preview: URL.createObjectURL(file), // Create preview URL
    filename: file.name
  };
  setXrayRecords(updatedRecords);
  
  alert('Image selected successfully');
};
  const handleNoteChange = (index, value) => {
    const updatedRecords = [...xrayRecords];
    updatedRecords[index].note = value;
    setXrayRecords(updatedRecords);
  };

const handleAddResult = async () => {
  // Validate
  const validationErrors = [];
  
  xrayRecords.forEach((record, index) => {
    if (!record.file) {
      validationErrors.push(`Record ${index + 1}: X-ray image is required`);
    }
  });
  
  if (validationErrors.length > 0) {
    alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
    return;
  }
  
  setLoading(true);
  
  try {
    // Create FormData
    const formData = new FormData();
    
    // Add all files
    xrayRecords.forEach((record) => {
      if (record.file) {
        formData.append('images', record.file);
      }
    });
    
    // Add other data
    formData.append('patientId', singlePatient._id);
    formData.append('patientName', singlePatient.name);
    formData.append('patientUniqueId', singlePatient.uniqueID);
    formData.append('age', singlePatient.age);
    formData.append('gender', singlePatient.gender);
    formData.append('doctorId', selectedTest.doctorId);
    formData.append('doctorName', selectedTest.doctorName);
    formData.append('testName', xrayResult.testName || selectedTest.testName);
    formData.append('category', xrayResult.category || selectedTest.category);
    formData.append('diagnosis', selectedTest.diagnosis || '');
    formData.append('overallNotes', xrayResult.overallNotes || '');
    formData.append('instructions', selectedTest.instructions || '');
    formData.append('performedBy', name || 'X-ray Technician');
    formData.append('performedDate', xrayResult.performedDate);
    formData.append('priority', selectedTest.priority || 'Routine');
    
    // Add notes
    const notes = xrayRecords.map(record => record.note || '');
    formData.append('notes', JSON.stringify(notes));
    
    
    // Call store function
    const result = await createXrayRecord(formData);
    
    if (result && result.success) {
      alert('X-ray results saved successfully!');
      setShowAddResult(false);
      
      // Refresh
      await getPatientByUniqueId(searchId);
      
      // Reset form
      setXrayRecords([{
        file: null,
        preview: null,
        note: ''
      }]);
      setXrayResult({
        testName: '',
        category: '',
        overallNotes: '',
        performedBy: name,
        performedDate: new Date().toISOString().split('T')[0]
      });
      
    } else {
      alert(`Failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  } finally {
    setLoading(false);
  }
};
  const getAllPatientXrays = () => {
    const allXrays = [];
    if (singlePatient && singlePatient.recommendedTests) {
      singlePatient.recommendedTests.forEach(testGroup => {
        if (testGroup.tests && testGroup.tests.length > 0) {
          testGroup.tests.filter(test => test.xRay === true).forEach(test => {
            allXrays.push({
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
    return allXrays;
  };

  const allXrays = getAllPatientXrays();

  const handleViewImage = (imageData) => {
    setPreviewImage(imageData);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
       

    

<div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
        <Image className="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
          X-ray Management System
        </h1>
        <p className="text-gray-600 text-sm md:text-base mt-1">
          Advanced imaging and diagnostic management
        </p>
      </div>
    </div>
    
    {/* Stats Badges */}
    <div className="flex flex-wrap gap-2 mt-3 md:mt-0 md:ml-6">
      <div className="px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
        <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Digital Imaging
        </span>
      </div>
      <div className="px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
        <span className="text-xs font-medium text-green-700 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Cloud Storage
        </span>
      </div>
    </div>
  </div>
  
  {/* Action Buttons Group */}
  <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
    {/* Walk-in Actions Group */}
    <div className="flex gap-2">
      <button 
        onClick={() => navigate('/walkin-registration')}
        className="group relative px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <div className="p-1.5 bg-white/20 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <span className="font-medium text-sm">New Walk-in</span>
      </button>
      
      <button 
        onClick={() => navigate('/walkin-record')}
        className="group relative px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <div className="p-1.5 bg-white/20 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className="font-medium text-sm">Walk-in Records</span>
      </button>
    </div>
    
    {/* All Records Button */}
    <button 
      onClick={() => navigate('/xrayTest')}
      className="group relative px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 overflow-hidden"
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
      <div className="p-1.5 bg-white/20 rounded-lg">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <span className="font-medium text-sm">All Records</span>
    </button>
  </div>
</div>






          {/* Search Section */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                 <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      Patient Search & Management
    </h2>
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

          {/* Add Result Modal with Image Uploads */}
          {showAddResult && selectedTest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Camera className="w-6 h-6 text-blue-600" />
                      Add X-ray Results
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
                    <h3 className="font-semibold text-gray-900 mb-3">X-ray Information</h3>
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
                            : selectedTest.priority === 'Emergency'
                            ? 'bg-red-200 text-red-900'
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

                  {/* X-ray Records Form */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">X-ray Images & Notes</h3>
                      <button
                        onClick={handleAddRecord}
                        type="button"
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        Add Another Image
                      </button>
                    </div>
                    
                    {xrayRecords.map((record, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">X-ray Record {index + 1}</h4>
                          {xrayRecords.length > 1 && (
                            <button
                              onClick={() => handleRemoveRecord(index)}
                              type="button"
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {/* Image Upload */}
                        {/* Replace the image upload section with: */}
<div>
  <label className="block text-xs font-medium text-gray-700 mb-2">
    X-ray Image * (JPEG, PNG, BMP - Max 10MB)
  </label>
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleImageUpload(index, e.target.files[0])}
      className="hidden"
      id={`xray-file-${index}`}
    />
    <label
      htmlFor={`xray-file-${index}`}
      className="cursor-pointer flex flex-col items-center justify-center"
    >
      <Upload className="w-8 h-8 text-gray-400 mb-2" />
      <span className="text-sm text-gray-600">
        {record.file ? 'Change Image' : 'Click to Upload X-ray Image'}
      </span>
      <span className="text-xs text-gray-500 mt-1">
        Max 10MB • JPEG, PNG, BMP
      </span>
    </label>
  </div>
  
  {/* Show preview if image selected */}
  {record.preview && (
    <div className="mt-3">
      <p className="text-xs text-gray-600 mb-1">Preview:</p>
      <div className="relative w-32 h-32">
        <img
          src={record.preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover rounded border border-gray-300"
        />
        <button
          type="button"
          onClick={() => handleViewImage(record.preview)}
          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
        >
          <Eye className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {record.filename} • {(record.file.size / 1024 / 1024).toFixed(2)}MB
      </p>
    </div>
  )}
</div>
                          
                          {/* Note Input */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Notes for this X-ray
                            </label>
                            <textarea
                              value={record.note}
                              onChange={(e) => handleNoteChange(index, e.target.value)}
                              rows="2"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Add notes about this x-ray image (optional)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Performed Date
                        </label>
                        <input
                          type="date"
                          value={xrayResult.performedDate}
                          onChange={(e) => setXrayResult({...xrayResult, performedDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Performed By
                        </label>
                        <input
                          type="text"
                          value={xrayResult.performedBy}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Charges Detail
                      </label>
                      <textarea
                        value={xrayResult.overallNotes}
                        onChange={(e) => setXrayResult({...xrayResult, overallNotes: e.target.value})}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Charges Detail..."
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
                          Save All X-ray Results
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview Modal */}
          {previewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">X-ray Image Preview</h3>
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-4 overflow-auto">
                  <img
                    src={previewImage}
                    alt="X-ray preview"
                    className="max-w-full max-h-[70vh] mx-auto"
                  />
                </div>
                <div className="p-4 border-t text-center">
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    X-ray Statistics
                  </h3>
                  <div className="space-y-2">
                    <InfoRow 
                      label="Total X-rays" 
                      value={allXrays.length || 0} 
                    />
                    <InfoRow 
                      label="Pending X-rays" 
                      value={
                        allXrays.filter(t => t.status === 'Pending').length || 0
                      } 
                    />
                    <InfoRow 
                      label="Completed X-rays" 
                      value={
                        allXrays.filter(t => t.status === 'Completed').length || 0
                      } 
                    />
                  </div>
                </div>
              </div>

              {/* Patient X-rays Table */}
              {allXrays.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Image className="w-5 h-5 text-blue-600" />
                      Patient X-rays
                      <span className="text-sm font-normal text-gray-500">
                        ({allXrays.length} x-rays)
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
                        {allXrays.map((xray, index) => {
                          const records = xray.records || [];
                          return (
                            <tr key={xray._id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Image className="w-4 h-4 text-blue-500" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {xray.testName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {xray.category}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{xray.category}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{xray.doctorName}</div>
                                <div className="text-xs text-gray-500">{xray.specialist}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  xray.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {xray.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {xray.recommendedDate ? new Date(xray.recommendedDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </td>
                             
                              <td className="px-6 py-4">
                                {xray.status === 'Pending' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedTest(xray);
                                      setXrayResult({
                                        testName: xray.testName,
                                        category: xray.category,
                                        overallNotes: '',
                                        performedBy: name,
                                        performedDate: new Date().toISOString().split('T')[0],
                                        records: []
                                      });
                                      setXrayRecords([{
                                        image: null,
                                        note: ''
                                      }]);
                                      setShowAddResult(true);
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add X-ray Images
                                  </button>
                                ) : (
                                  <div className="flex gap-2">
                                      <button
                                    //   onClick={()=>navigate('/xrayTest')}
                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 text-sm"
                                      >
                                   ✔️
                                      </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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

export default Xray;



































// import React, { useState } from 'react';
// import patientStore from '../../store/patientStore';
// import xrayStore from '../../store/xrayStore';
// import { 
//   Search, User, FileText, CheckCircle, XCircle, 
//   FileCheck, Activity, Image, Camera, Clock, AlertCircle, 
//   Plus, Upload, Trash2, Eye, UserPlus
// } from 'lucide-react';
// import { useLocation, useNavigate } from 'react-router-dom';

// function Xray() {
//   const { getPatientByUniqueId, singlePatient } = patientStore();
//   const { createXrayRecord } = xrayStore();
//   const location = useLocation();
//   const { name } = location.state || {};
//   const [searchId, setSearchId] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [patientFound, setPatientFound] = useState(false);
//   const [selectedTest, setSelectedTest] = useState(null);
//   const [showAddResult, setShowAddResult] = useState(false);
//   const [showWalkInModal, setShowWalkInModal] = useState(false);
//   const [xrayRecords, setXrayRecords] = useState([
//     {
//       file: null,
//       preview: null,
//       note: ''
//     }
//   ]);
//   const [xrayResult, setXrayResult] = useState({
//     testName: '',
//     category: '',
//     overallNotes: '',
//     performedBy: name,
//     performedDate: new Date().toISOString().split('T')[0],
//     records: []
//   });
  
//   // Walk-in patient state
//   const [walkInPatient, setWalkInPatient] = useState({
//     patientName: '',
//     patientAge: '',
//     patientGender: 'Male',
//     patientPhone: '',
//     patientAddress: '',
//     doctorName: name,
//     testName: '',
//     category: '',
//     diagnosis: '',
//     instructions: '',
//     priority: 'Routine'
//   });
  
//   const [previewImage, setPreviewImage] = useState(null);
//   const navigate = useNavigate();

//   const handleSearch = async () => {
//     if (!searchId.trim()) {
//       alert('Please enter Patient ID');
//       return;
//     }
    
//     setLoading(true);
//     setPatientFound(false);
//     setSelectedTest(null);
//     setXrayRecords([{
//       file: null,
//       preview: null,
//       note: ''
//     }]);
//     setXrayResult({
//       testName: '',
//       category: '',
//       overallNotes: '',
//       performedBy: name,
//       performedDate: new Date().toISOString().split('T')[0],
//       records: []
//     });
    
//     try {
//       // Clear previous patient data
//       ({ singlePatient: null });
      
//       const patient = await getPatientByUniqueId(searchId);
      
//       if (patient) {
//         setPatientFound(true);
        
//         const pendingTests = [];
//         if (patient.recommendedTests && patient.recommendedTests.length > 0) {
//           patient.recommendedTests.forEach(testGroup => {
//             if (testGroup.tests && testGroup.tests.length > 0) {
//               testGroup.tests.forEach(test => {
//                 if (test.xRay === true && test.status === 'Pending') {
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
//           setXrayResult({
//             testName: pendingTests[0].testName,
//             category: pendingTests[0].category,
//             overallNotes: '',
//             performedBy: name,
//             performedDate: new Date().toISOString().split('T')[0],
//             records: []
//           });
//           setXrayRecords([{
//             file: null,
//             preview: null,
//             note: ''
//           }]);
//         } else {
//           setSelectedTest(null);
//         }
//       } else {
//         alert('Patient not found with this ID');
//       }
//     } catch (error) {
//       alert(`Error searching patient: ${error.message || 'Unknown error'}`);
//       setPatientFound(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddRecord = () => {
//     setXrayRecords([...xrayRecords, {
//       file: null,
//       preview: null,
//       note: ''
//     }]);
//   };

//   const handleRemoveRecord = (index) => {
//     if (xrayRecords.length > 1) {
//       const updatedRecords = [...xrayRecords];
//       updatedRecords.splice(index, 1);
//       setXrayRecords(updatedRecords);
//     }
//   };

//   const handleImageUpload = (index, file) => {
//     if (!file) return;
    
//     const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];
//     if (!validTypes.includes(file.type)) {
//       alert('Please upload only image files (JPEG, PNG, BMP)');
//       return;
//     }
    
//     if (file.size > 10 * 1024 * 1024) {
//       alert('Image size should be less than 10MB');
//       return;
//     }
    
//     const updatedRecords = [...xrayRecords];
//     updatedRecords[index] = {
//       ...updatedRecords[index],
//       file: file,
//       preview: URL.createObjectURL(file),
//       filename: file.name
//     };
//     setXrayRecords(updatedRecords);
    
//     alert('Image selected successfully');
//   };

//   const handleNoteChange = (index, value) => {
//     const updatedRecords = [...xrayRecords];
//     updatedRecords[index].note = value;
//     setXrayRecords(updatedRecords);
//   };

//   const handleAddResult = async () => {
//     const validationErrors = [];
    
//     xrayRecords.forEach((record, index) => {
//       if (!record.file) {
//         validationErrors.push(`Record ${index + 1}: X-ray image is required`);
//       }
//     });
    
//     if (validationErrors.length > 0) {
//       alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       const formData = new FormData();
      
//       xrayRecords.forEach((record, index) => {
//         if (record.file) {
//           formData.append('images', record.file);
//         }
//       });
      
//       formData.append('patientId', singlePatient._id);
//       formData.append('patientName', singlePatient.name);
//       formData.append('patientUniqueId', singlePatient.uniqueID);
//       formData.append('age', singlePatient.age);
//       formData.append('gender', singlePatient.gender);
//       formData.append('doctorId', selectedTest.doctorId);
//       formData.append('doctorName', selectedTest.doctorName);
//       formData.append('testName', xrayResult.testName || selectedTest.testName);
//       formData.append('category', xrayResult.category || selectedTest.category);
//       formData.append('diagnosis', selectedTest.diagnosis || '');
//       formData.append('overallNotes', xrayResult.overallNotes || '');
//       formData.append('instructions', selectedTest.instructions || '');
//       formData.append('performedBy', name || 'X-ray Technician');
//       formData.append('performedDate', xrayResult.performedDate);
//       formData.append('priority', selectedTest.priority || 'Routine');
      
//       const notes = xrayRecords.map(record => record.note || '');
//       formData.append('notes', JSON.stringify(notes));
      
//       const result = await createXrayRecord(formData);
      
//       if (result && result.success) {
//         alert('X-ray results saved successfully!');
//         setShowAddResult(false);
//         await getPatientByUniqueId(searchId);
//         setXrayRecords([{
//           file: null,
//           preview: null,
//           note: ''
//         }]);
//         setXrayResult({
//           testName: '',
//           category: '',
//           overallNotes: '',
//           performedBy: name,
//           performedDate: new Date().toISOString().split('T')[0]
//         });
//       } else {
//         alert(`Failed: ${result.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Walk-in patient functions
//   const handleSaveWalkInPatient = async () => {
//     // Validate walk-in patient data
//     const validationErrors = [];
    
//     if (!walkInPatient.patientName.trim()) {
//       validationErrors.push('Patient name is required');
//     }
//     if (!walkInPatient.patientAge || isNaN(walkInPatient.patientAge)) {
//       validationErrors.push('Valid patient age is required');
//     }
//     if (!walkInPatient.testName.trim()) {
//       validationErrors.push('Test name is required');
//     }
//     if (!walkInPatient.category.trim()) {
//       validationErrors.push('Category is required');
//     }
    
//     // Validate images
//     xrayRecords.forEach((record, index) => {
//       if (!record.file) {
//         validationErrors.push(`X-ray image ${index + 1} is required`);
//       }
//     });
    
//     if (validationErrors.length > 0) {
//       alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       const formData = new FormData();
      
//       // Add all files
//       xrayRecords.forEach((record, index) => {
//         if (record.file) {
//           formData.append('images', record.file);
//         }
//       });
      
//       // Generate a temporary patient ID
//       const tempPatientId = `WALKIN-${Date.now()}`;
      
//       // Add walk-in patient data
//       formData.append('patientId', tempPatientId);
//       formData.append('patientName', walkInPatient.patientName);
//       formData.append('patientUniqueId', tempPatientId);
//       formData.append('age', walkInPatient.patientAge);
//       formData.append('gender', walkInPatient.patientGender);
//       formData.append('doctorId', 'walkin-doctor');
//       formData.append('doctorName', walkInPatient.doctorName);
//       formData.append('testName', walkInPatient.testName);
//       formData.append('category', walkInPatient.category);
//       formData.append('diagnosis', walkInPatient.diagnosis || '');
//       formData.append('overallNotes', xrayResult.overallNotes || '');
//       formData.append('instructions', walkInPatient.instructions || '');
//       formData.append('performedBy', name || 'X-ray Technician');
//       formData.append('performedDate', xrayResult.performedDate);
//       formData.append('priority', walkInPatient.priority);
      
//       // Add notes
//       const notes = xrayRecords.map(record => record.note || '');
//       formData.append('notes', JSON.stringify(notes));
      
//       // Call the API to save x-ray record
//       const result = await createXrayRecord(formData);
      
//       if (result && result.success) {
//         alert('Walk-in patient x-ray saved successfully!');
        
//         // Reset forms
//         setShowWalkInModal(false);
//         setWalkInPatient({
//           patientName: '',
//           patientAge: '',
//           patientGender: 'Male',
//           patientPhone: '',
//           patientAddress: '',
//           doctorName: name,
//           testName: '',
//           category: '',
//           diagnosis: '',
//           instructions: '',
//           priority: 'Routine'
//         });
//         setXrayRecords([{
//           file: null,
//           preview: null,
//           note: ''
//         }]);
//         setXrayResult({
//           testName: '',
//           category: '',
//           overallNotes: '',
//           performedBy: name,
//           performedDate: new Date().toISOString().split('T')[0],
//           records: []
//         });
//       } else {
//         alert(`Failed to save: ${result.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Error saving walk-in patient:', error);
//       alert(`Error: ${error.message || 'Failed to save walk-in patient'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getAllPatientXrays = () => {
//     const allXrays = [];
//     if (singlePatient && singlePatient.recommendedTests) {
//       singlePatient.recommendedTests.forEach(testGroup => {
//         if (testGroup.tests && testGroup.tests.length > 0) {
//           testGroup.tests.filter(test => test.xRay === true).forEach(test => {
//             allXrays.push({
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
//     return allXrays;
//   };

//   const allXrays = getAllPatientXrays();

//   const handleViewImage = (imageData) => {
//     setPreviewImage(imageData);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
        
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
//                 <Image className="w-8 h-8 text-blue-600" />
//                 X-ray Management System
//               </h1>
//               <p className="text-gray-600 mt-1">Search patient by ID to add x-ray results</p>
//             </div>
            
//             <div className="flex gap-3 mt-4 md:mt-0">
//               {/* ADDED: Walk-in Patient Button */}
//               <button 
//                 onClick={() => setShowWalkInModal(true)}
//                 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
//               >
//                 <UserPlus className="w-4 h-4" />
//                 Walk-in Patient
//               </button>
              
//               <button 
//                 onClick={() => navigate('/xrayTest')}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
//               >
//                 <FileText className="w-4 h-4" />
//                 All X-ray Records
//               </button>
//             </div>
//           </div>

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

//           {/* WALK-IN PATIENT MODAL */}
//           {showWalkInModal && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//               <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                   <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                       <UserPlus className="w-6 h-6 text-purple-600" />
//                       Walk-in Patient X-ray
//                     </h2>
//                     <button
//                       onClick={() => setShowWalkInModal(false)}
//                       className="p-2 hover:bg-gray-100 rounded-full"
//                     >
//                       <XCircle className="w-5 h-5 text-gray-500" />
//                     </button>
//                   </div>

//                   {/* Patient Information Form */}
//                   <div className="space-y-4 mb-6">
//                     <h3 className="font-semibold text-gray-900 border-b pb-2">Patient Information</h3>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Patient Name *
//                         </label>
//                         <input
//                           type="text"
//                           value={walkInPatient.patientName}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, patientName: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Enter patient name"
//                           required
//                         />
//                       </div>
                      
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Age *
//                         </label>
//                         <input
//                           type="number"
//                           value={walkInPatient.patientAge}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, patientAge: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Age"
//                           min="0"
//                           max="120"
//                           required
//                         />
//                       </div>
                      
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Gender *
//                         </label>
//                         <select
//                           value={walkInPatient.patientGender}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, patientGender: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="Male">Male</option>
//                           <option value="Female">Female</option>
//                           <option value="Other">Other</option>
//                         </select>
//                       </div>
                      
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Phone Number
//                         </label>
//                         <input
//                           type="text"
//                           value={walkInPatient.patientPhone}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, patientPhone: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Phone number (optional)"
//                         />
//                       </div>
                      
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Address
//                         </label>
//                         <textarea
//                           value={walkInPatient.patientAddress}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, patientAddress: e.target.value})}
//                           rows="2"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Address (optional)"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* X-ray Details */}
//                   <div className="space-y-4 mb-6">
//                     <h3 className="font-semibold text-gray-900 border-b pb-2">X-ray Details</h3>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Test Name *
//                         </label>
//                         <input
//                           type="text"
//                           value={walkInPatient.testName}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, testName: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., Chest X-ray"
//                           required
//                         />
//                       </div>
                      
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Category *
//                         </label>
//                         <input
//                           type="text"
//                           value={walkInPatient.category}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, category: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="e.g., Chest PA"
//                           required
//                         />
//                       </div>
                      
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Priority *
//                         </label>
//                         <select
//                           value={walkInPatient.priority}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, priority: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="Routine">Routine</option>
//                           <option value="Urgent">Urgent</option>
//                           <option value="Emergency">Emergency</option>
//                         </select>
//                       </div>
                      
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Doctor
//                         </label>
//                         <input
//                           type="text"
//                           value={walkInPatient.doctorName}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, doctorName: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Doctor name"
//                         />
//                       </div>
                      
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Diagnosis
//                         </label>
//                         <textarea
//                           value={walkInPatient.diagnosis}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, diagnosis: e.target.value})}
//                           rows="2"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Diagnosis (optional)"
//                         />
//                       </div>
                      
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Instructions
//                         </label>
//                         <textarea
//                           value={walkInPatient.instructions}
//                           onChange={(e) => setWalkInPatient({...walkInPatient, instructions: e.target.value})}
//                           rows="2"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Special instructions (optional)"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* X-ray Images Section (Reuse existing component) */}
//                   <div className="space-y-4 mb-6">
//                     <div className="flex justify-between items-center">
//                       <h3 className="font-semibold text-gray-900">X-ray Images & Notes</h3>
//                       <button
//                         onClick={handleAddRecord}
//                         type="button"
//                         className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
//                       >
//                         <Plus className="w-3 h-3" />
//                         Add Another Image
//                       </button>
//                     </div>
                    
//                     {xrayRecords.map((record, index) => (
//                       <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
//                         <div className="flex justify-between items-center mb-3">
//                           <h4 className="font-medium text-gray-900">X-ray Record {index + 1}</h4>
//                           {xrayRecords.length > 1 && (
//                             <button
//                               onClick={() => handleRemoveRecord(index)}
//                               type="button"
//                               className="p-1 text-red-600 hover:text-red-800"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           )}
//                         </div>
                        
//                         <div className="space-y-3">
//                           {/* Image Upload */}
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-2">
//                               X-ray Image * (JPEG, PNG, BMP - Max 10MB)
//                             </label>
//                             <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
//                               <input
//                                 type="file"
//                                 accept="image/*"
//                                 onChange={(e) => handleImageUpload(index, e.target.files[0])}
//                                 className="hidden"
//                                 id={`walkin-xray-file-${index}`}
//                               />
//                               <label
//                                 htmlFor={`walkin-xray-file-${index}`}
//                                 className="cursor-pointer flex flex-col items-center justify-center"
//                               >
//                                 <Upload className="w-8 h-8 text-gray-400 mb-2" />
//                                 <span className="text-sm text-gray-600">
//                                   {record.file ? 'Change Image' : 'Click to Upload X-ray Image'}
//                                 </span>
//                                 <span className="text-xs text-gray-500 mt-1">
//                                   Max 10MB • JPEG, PNG, BMP
//                                 </span>
//                               </label>
//                             </div>
                            
//                             {record.preview && (
//                               <div className="mt-3">
//                                 <p className="text-xs text-gray-600 mb-1">Preview:</p>
//                                 <div className="relative w-32 h-32">
//                                   <img
//                                     src={record.preview}
//                                     alt={`Preview ${index + 1}`}
//                                     className="w-full h-full object-cover rounded border border-gray-300"
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() => handleViewImage(record.preview)}
//                                     className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
//                                   >
//                                     <Eye className="w-3 h-3" />
//                                   </button>
//                                 </div>
//                                 <p className="text-xs text-gray-500 mt-1">
//                                   {record.filename} • {(record.file.size / 1024 / 1024).toFixed(2)}MB
//                                 </p>
//                               </div>
//                             )}
//                           </div>
                          
//                           {/* Note Input */}
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">
//                               Notes for this X-ray
//                             </label>
//                             <textarea
//                               value={record.note}
//                               onChange={(e) => handleNoteChange(index, e.target.value)}
//                               rows="2"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                               placeholder="Add notes about this x-ray image (optional)"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Overall Information */}
//                   <div className="space-y-4 mb-6">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Performed Date
//                         </label>
//                         <input
//                           type="date"
//                           value={xrayResult.performedDate}
//                           onChange={(e) => setXrayResult({...xrayResult, performedDate: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Performed By
//                         </label>
//                         <input
//                           type="text"
//                           value={xrayResult.performedBy}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Charges Detail
//                       </label>
//                       <textarea
//                         value={xrayResult.overallNotes}
//                         onChange={(e) => setXrayResult({...xrayResult, overallNotes: e.target.value})}
//                         rows="3"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="Charges Detail..."
//                       />
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
//                     <button
//                       onClick={() => {
//                         setShowWalkInModal(false);
//                         // Reset forms
//                         setWalkInPatient({
//                           patientName: '',
//                           patientAge: '',
//                           patientGender: 'Male',
//                           patientPhone: '',
//                           patientAddress: '',
//                           doctorName: name,
//                           testName: '',
//                           category: '',
//                           diagnosis: '',
//                           instructions: '',
//                           priority: 'Routine'
//                         });
//                         setXrayRecords([{
//                           file: null,
//                           preview: null,
//                           note: ''
//                         }]);
//                       }}
//                       className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleSaveWalkInPatient}
//                       disabled={loading}
//                       className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {loading ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                           Saving...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle className="w-4 h-4" />
//                           Save Walk-in X-ray
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* (Keep existing modals and components below - they remain the same) */}
//            {showAddResult && selectedTest && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//               <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                 <div className="p-6">
//                   <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                       <Camera className="w-6 h-6 text-blue-600" />
//                       Add X-ray Results
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
//                     <h3 className="font-semibold text-gray-900 mb-3">X-ray Information</h3>
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
//                             : selectedTest.priority === 'Emergency'
//                             ? 'bg-red-200 text-red-900'
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

//                   {/* X-ray Records Form */}
//                   <div className="space-y-4 mb-6">
//                     <div className="flex justify-between items-center">
//                       <h3 className="font-semibold text-gray-900">X-ray Images & Notes</h3>
//                       <button
//                         onClick={handleAddRecord}
//                         type="button"
//                         className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
//                       >
//                         <Plus className="w-3 h-3" />
//                         Add Another Image
//                       </button>
//                     </div>
                    
//                     {xrayRecords.map((record, index) => (
//                       <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
//                         <div className="flex justify-between items-center mb-3">
//                           <h4 className="font-medium text-gray-900">X-ray Record {index + 1}</h4>
//                           {xrayRecords.length > 1 && (
//                             <button
//                               onClick={() => handleRemoveRecord(index)}
//                               type="button"
//                               className="p-1 text-red-600 hover:text-red-800"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           )}
//                         </div>
                        
//                         <div className="space-y-3">
//                           {/* Image Upload */}
//                         {/* Replace the image upload section with: */}
// <div>
//   <label className="block text-xs font-medium text-gray-700 mb-2">
//     X-ray Image * (JPEG, PNG, BMP - Max 10MB)
//   </label>
//   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
//     <input
//       type="file"
//       accept="image/*"
//       onChange={(e) => handleImageUpload(index, e.target.files[0])}
//       className="hidden"
//       id={`xray-file-${index}`}
//     />
//     <label
//       htmlFor={`xray-file-${index}`}
//       className="cursor-pointer flex flex-col items-center justify-center"
//     >
//       <Upload className="w-8 h-8 text-gray-400 mb-2" />
//       <span className="text-sm text-gray-600">
//         {record.file ? 'Change Image' : 'Click to Upload X-ray Image'}
//       </span>
//       <span className="text-xs text-gray-500 mt-1">
//         Max 10MB • JPEG, PNG, BMP
//       </span>
//     </label>
//   </div>
  
//   {/* Show preview if image selected */}
//   {record.preview && (
//     <div className="mt-3">
//       <p className="text-xs text-gray-600 mb-1">Preview:</p>
//       <div className="relative w-32 h-32">
//         <img
//           src={record.preview}
//           alt={`Preview ${index + 1}`}
//           className="w-full h-full object-cover rounded border border-gray-300"
//         />
//         <button
//           type="button"
//           onClick={() => handleViewImage(record.preview)}
//           className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
//         >
//           <Eye className="w-3 h-3" />
//         </button>
//       </div>
//       <p className="text-xs text-gray-500 mt-1">
//         {record.filename} • {(record.file.size / 1024 / 1024).toFixed(2)}MB
//       </p>
//     </div>
//   )}
// </div>
                          
//                           {/* Note Input */}
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">
//                               Notes for this X-ray
//                             </label>
//                             <textarea
//                               value={record.note}
//                               onChange={(e) => handleNoteChange(index, e.target.value)}
//                               rows="2"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                               placeholder="Add notes about this x-ray image (optional)"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Overall Information */}
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Performed Date
//                         </label>
//                         <input
//                           type="date"
//                           value={xrayResult.performedDate}
//                           onChange={(e) => setXrayResult({...xrayResult, performedDate: e.target.value})}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Performed By
//                         </label>
//                         <input
//                           type="text"
//                           value={xrayResult.performedBy}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Charges Detail
//                       </label>
//                       <textarea
//                         value={xrayResult.overallNotes}
//                         onChange={(e) => setXrayResult({...xrayResult, overallNotes: e.target.value})}
//                         rows="3"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="Charges Detail..."
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
//                           Save All X-ray Results
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Image Preview Modal */}
//             {previewImage && (
//             <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
//               <div className="bg-white rounded-lg max-w-4xl max-h-[90vh]">
//                 <div className="p-4 border-b flex justify-between items-center">
//                   <h3 className="font-semibold text-gray-900">X-ray Image Preview</h3>
//                   <button
//                     onClick={() => setPreviewImage(null)}
//                     className="p-1 hover:bg-gray-100 rounded-full"
//                   >
//                     <XCircle className="w-5 h-5 text-gray-500" />
//                   </button>
//                 </div>
//                 <div className="p-4 overflow-auto">
//                   <img
//                     src={previewImage}
//                     alt="X-ray preview"
//                     className="max-w-full max-h-[70vh] mx-auto"
//                   />
//                 </div>
//                 <div className="p-4 border-t text-center">
//                   <button
//                     onClick={() => setPreviewImage(null)}
//                     className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//            {patientFound && singlePatient && (
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
//                     X-ray Statistics
//                   </h3>
//                   <div className="space-y-2">
//                     <InfoRow 
//                       label="Total X-rays" 
//                       value={allXrays.length || 0} 
//                     />
//                     <InfoRow 
//                       label="Pending X-rays" 
//                       value={
//                         allXrays.filter(t => t.status === 'Pending').length || 0
//                       } 
//                     />
//                     <InfoRow 
//                       label="Completed X-rays" 
//                       value={
//                         allXrays.filter(t => t.status === 'Completed').length || 0
//                       } 
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Patient X-rays Table */}
//               {allXrays.length > 0 && (
//                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
//                   <div className="p-6 border-b border-gray-200 bg-gray-50">
//                     <h3 className="font-semibold text-gray-900 flex items-center gap-2">
//                       <Image className="w-5 h-5 text-blue-600" />
//                       Patient X-rays
//                       <span className="text-sm font-normal text-gray-500">
//                         ({allXrays.length} x-rays)
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
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {allXrays.map((xray, index) => {
//                           const records = xray.records || [];
//                           return (
//                             <tr key={xray._id || index} className="hover:bg-gray-50">
//                               <td className="px-6 py-4">
//                                 <div className="flex items-center gap-2">
//                                   <Image className="w-4 h-4 text-blue-500" />
//                                   <div>
//                                     <div className="text-sm font-medium text-gray-900">
//                                       {xray.testName}
//                                     </div>
//                                     <div className="text-xs text-gray-500 mt-1">
//                                       {xray.category}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900">{xray.category}</div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900">{xray.doctorName}</div>
//                                 <div className="text-xs text-gray-500">{xray.specialist}</div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                   xray.status === 'Completed'
//                                     ? 'bg-green-100 text-green-800'
//                                     : 'bg-yellow-100 text-yellow-800'
//                                 }`}>
//                                   {xray.status}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900">
//                                   {xray.recommendedDate ? new Date(xray.recommendedDate).toLocaleDateString() : 'N/A'}
//                                 </div>
//                               </td>
                             
//                               <td className="px-6 py-4">
//                                 {xray.status === 'Pending' ? (
//                                   <button
//                                     onClick={() => {
//                                       setSelectedTest(xray);
//                                       setXrayResult({
//                                         testName: xray.testName,
//                                         category: xray.category,
//                                         overallNotes: '',
//                                         performedBy: name,
//                                         performedDate: new Date().toISOString().split('T')[0],
//                                         records: []
//                                       });
//                                       setXrayRecords([{
//                                         image: null,
//                                         note: ''
//                                       }]);
//                                       setShowAddResult(true);
//                                     }}
//                                     className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
//                                   >
//                                     <Plus className="w-3 h-3" />
//                                     Add X-ray Images
//                                   </button>
//                                 ) : (
//                                   <div className="flex gap-2">
//                                       <button
//                                     //   onClick={()=>navigate('/xrayTest')}
//                                         className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 text-sm"
//                                       >
//                                    ✔️
//                                       </button>
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

// export default Xray;