import React, { useState } from 'react';
import { 
  User, Camera, Upload, Save, ArrowLeft,
  Phone, Calendar, CreditCard, Image
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import xrayStore from '../../store/xrayStore';

function XrayPatientRegistration() {
  const navigate = useNavigate();
  const { createWalkInXrayRecord } = xrayStore();
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    age: '',
    phone: '',
    testName: '',
    category: 'chest',
    priority: 'routine',
    instructions: '',
    overallNotes: '',
    performedBy: '',
    performedDate: new Date().toISOString().split('T')[0]
  });

  const [xrayImages, setXrayImages] = useState([
    {
      file: null,
      preview: null,
      filename: '',
      note: ''
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Gender Options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  // X-ray Categories
  const xrayCategories = [
    { value: 'chest', label: 'Chest X-ray' },
    { value: 'abdomen', label: 'Abdomen X-ray' },
    { value: 'spine', label: 'Spine X-ray' },
    { value: 'skull', label: 'Skull X-ray' },
    { value: 'extremities', label: 'Extremities X-ray' },
    { value: 'dental', label: 'Dental X-ray' },
    { value: 'mammography', label: 'Mammography' },
    { value: 'other', label: 'Other' }
  ];

  // Priority Levels
  const priorityOptions = [
    { value: 'emergency', label: 'Emergency', color: 'text-red-600 bg-red-50' },
    { value: 'urgent', label: 'Urgent', color: 'text-orange-600 bg-orange-50' },
    { value: 'routine', label: 'Routine', color: 'text-green-600 bg-green-50' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddImage = () => {
    setXrayImages([
      ...xrayImages,
      {
        file: null,
        preview: null,
        filename: '',
        note: ''
      }
    ]);
  };

  const handleRemoveImage = (index) => {
    if (xrayImages.length > 1) {
      const updatedImages = [...xrayImages];
      updatedImages.splice(index, 1);
      setXrayImages(updatedImages);
    }
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/dicom'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please upload only image files (JPEG, PNG, BMP, DICOM)');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }
    
    const updatedImages = [...xrayImages];
    updatedImages[index] = {
      ...updatedImages[index],
      file: file,
      preview: URL.createObjectURL(file),
      filename: file.name
    };
    setXrayImages(updatedImages);
  };

  const handleImageNoteChange = (index, value) => {
    const updatedImages = [...xrayImages];
    updatedImages[index].note = value;
    setXrayImages(updatedImages);
  };

  const handleViewImage = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Patient name is required');
    if (!formData.age) errors.push('Age is required');
    if (!formData.testName.trim()) errors.push('X-ray test name is required');
    if (!formData.performedBy.trim()) errors.push('Performed by (Technician name) is required');
    
    // Check if at least one image is uploaded
    const hasImage = xrayImages.some(img => img.file);
    if (!hasImage) errors.push('At least one X-ray image is required');
    
    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData
      const formDataToSend = new FormData();
      
      // Add patient information
      formDataToSend.append('name', formData.name);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('phone', formData.phone || '');
      formDataToSend.append('testName', formData.testName);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('instructions', formData.instructions);
      formDataToSend.append('overallNotes', formData.overallNotes);
      formDataToSend.append('performedBy', formData.performedBy);
      formDataToSend.append('performedDate', formData.performedDate);
      formDataToSend.append('walkIn', 'true');
      
      // Add all images
      xrayImages.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('images', image.file);
        }
      });
      
      // Add notes for each image
      const notes = xrayImages.map(img => img.note || '');
      formDataToSend.append('notes', JSON.stringify(notes));
      
      // Call the store function (you need to create this in xrayStore)
      const result = await createWalkInXrayRecord(formDataToSend);
      
      if (result && result.success) {
        alert('✅ Walk-in X-ray patient registered successfully!');
        
        // Reset form
        setFormData({
          name: '',
          gender: 'male',
          age: '',
          phone: '',
          testName: '',
          category: 'chest',
          priority: 'routine',
          instructions: '',
          overallNotes: '',
          performedBy: '',
          performedDate: new Date().toISOString().split('T')[0]
        });
        
        setXrayImages([{
          file: null,
          preview: null,
          filename: '',
          note: ''
        }]);
        
      } else {
        alert(`❌ Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('🚨 Error registering walk-in patient:', error);
      alert(`Error: ${error.message || 'Failed to register patient'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Camera className="w-8 h-8 text-blue-600" />
                Walk-in X-ray Patient Registration
              </h1>
              <p className="text-gray-600 mt-1">
                Register new walk-in patients for X-ray tests
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <button 
                onClick={() => navigate('/xray')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to X-ray
              </button>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Patient Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter patient full name"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <div className="flex gap-4">
                    {genderOptions.map(gender => (
                      <label key={gender.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={gender.value}
                          checked={formData.gender === gender.value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{gender.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter age"
                    min="0"
                    max="120"
                    required
                  />
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>
            </div>

            {/* X-ray Test Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                X-ray Test Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Test Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    X-ray Test Name *
                  </label>
                  <input
                    type="text"
                    name="testName"
                    value={formData.testName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Chest PA View, Lumbar Spine X-ray"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {xrayCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <div className="flex gap-3">
                    {priorityOptions.map(priority => (
                      <label key={priority.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span className={`text-sm px-3 py-1 rounded-full ${priority.color}`}>
                          {priority.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Performed Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Performed Date *
                  </label>
                  <input
                    type="date"
                    name="performedDate"
                    value={formData.performedDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Performed By */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Performed By (Technician) *
                  </label>
                  <input
                    type="text"
                    name="performedBy"
                    value={formData.performedBy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter technician name"
                    required
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special instructions..."
                  />
                </div>

                {/* Overall Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Charges details
                  </label>
                  <textarea
                    name="overallNotes"
                    value={formData.overallNotes}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Charges details..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - X-ray Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-600" />
                X-ray Images
              </h2>
              
              {/* Image Upload Section */}
              <div className="space-y-4">
                {xrayImages.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Image {index + 1}
                      </span>
                      {xrayImages.length > 1 && (
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {/* Image Preview */}
                    {image.preview ? (
                      <div className="mb-3">
                        <div 
                          className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => handleViewImage(image.preview)}
                        >
                          <img
                            src={image.preview}
                            alt={`X-ray ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {image.filename}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              Click to upload X-ray image
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              JPEG, PNG, BMP, DICOM (Max 10MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.bmp,.dcm"
                            onChange={(e) => handleImageUpload(index, e.target.files[0])}
                          />
                        </label>
                      </div>
                    )}
                    
                    {/* Image Note */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Note (Optional)
                      </label>
                      <textarea
                        value={image.note}
                        onChange={(e) => handleImageNoteChange(index, e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Note for this image..."
                      />
                    </div>
                  </div>
                ))}
                
                {/* Add More Images Button */}
                <button
                  onClick={handleAddImage}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Add Another Image
                </button>
              </div>
              
              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Registering Patient...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Register Walk-in Patient
                  </>
                )}
              </button>
              
              {/* Information Note */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Walk-in patients will be assigned a temporary ID and can be searched later using their phone number or assigned ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">X-ray Image Preview</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex justify-center items-center h-[70vh]">
              <img
                src={previewImage}
                alt="X-ray Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default XrayPatientRegistration;