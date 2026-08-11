import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Edit2, 
  Camera, 
  ChevronLeft,
  Save,
  X,
  CheckCircle,
  Key,
  Clock,
  AlertCircle,
  LogOut,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userStore from '../store/userStore';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, logoutUser} = userStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    allergies: '',
    SpecialistDoctor: '',
    ConsultationCharges: '',
    ConsultationTime: '',
    ConsultationTimePerPatient: '',
    TotalAppointments: '',
    licenseNumber:'',
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        bloodGroup: user.bloodGroup || '',
        allergies: user.allergies || '',
         SpecialistDoctor:user.SpecialistDoctor || '',
    ConsultationCharges:user.ConsultationCharges || '',
    ConsultationTime:user.ConsultationTime || '',
    ConsultationTimePerPatient:user.ConsultationTimePerPatient || '',
    TotalAppointments:user.TotalAppointments || '',
    licenseNumber:user.licenseNumber || '',
      });
    }
  }, [user]);

  // Check screen size
  useEffect(() => {

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Call updateProfile from userStore
      await updateProfile(formData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/persona-select');
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      emergencyContact: user.emergencyContact || '',
      bloodGroup: user.bloodGroup || '',
      allergies: user.allergies || '',
    SpecialistDoctor:user.SpecialistDoctor || '',
    ConsultationCharges:user.ConsultationCharges || '',
    ConsultationTime:user.ConsultationTime || '',
    ConsultationTimePerPatient:user.ConsultationTimePerPatient || '',
    Appointments:user.Appointments || '',
    TotalAppointments:user.TotalAppointments || '',
    licenseNumber:user.licenseNumber || ''
    
    });
    setIsEditing(false);
  };

  // Get role color
  const getRoleColor = (role) => {
    switch(role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Doctor': return 'bg-blue-100 text-blue-800';
      case 'Reception': return 'bg-green-100 text-green-800';
      case 'Patient': return 'bg-pink-100 text-pink-800';
      case 'Pharmacy': return 'bg-red-100 text-red-800';
      case 'Lab': return 'bg-amber-100 text-amber-800';
      case 'X-Ray': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
              {!isMobile && <span className="ml-2 font-medium">Back</span>}
            </button>

            {/* Page Title */}
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
              Profile Settings
            </h1>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {isEditing ? (
                <>
                  <X className="w-5 h-5 mr-1" />
                  {!isMobile && <span>Cancel Edit</span>}
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5 mr-1" />
                  {!isMobile && <span>Edit Profile</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-700 font-medium">{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {/* Profile Picture */}
              <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg border border-slate-200 hover:bg-gray-50 transition-colors">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="text-center mt-6">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleColor(user.role)}`}>
                  <Shield className="w-4 h-4 mr-1" />
                  {user.role}
                </div>
                <p className="text-gray-600 mt-2 flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </p>
              </div>

              {/* Stats */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Key className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-mono text-sm text-black font-medium">{user?.role}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-500 mr-3" />
                   {user && user.createdAt && (
  <div>
    <p className="text-sm text-gray-500">Member Since</p>
    <p className="text-sm text-black font-medium">{formatDate(user.createdAt)}</p>
  </div>
)}

                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <p className="text-sm font-medium text-green-600">
                        {user.verified ? 'Verified' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-8 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout Account
              </button>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      {user.email}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="+92312345.."
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        {user?.phone || 'Not provided'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter your complete address"
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-1 flex-shrink-0" />
                        <span>{user.address || 'Not provided'}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>



{/* Doctor Consultation Details */}
{user.role === "Doctor" && (
<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
    <ClipboardList className="w-5 h-5 mr-2 text-green-500" />
    Doctor Consultation Details
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Specialist Doctor */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Specialist
      </label>
      {isEditing ? (
        <input
          type="text"
          name="SpecialistDoctor"
          value={formData.SpecialistDoctor}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. Cardiologist"
        />
      ) : (
        <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
          <p className="text-gray-900">
            {user.SpecialistDoctor || "Not specified"}
          </p>
        </div>
      )}
    </div>

    {/* Consultation Charges */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Consultation Charges
      </label>
      {isEditing ? (
        <input
          type="number"
          name="ConsultationCharges"
          value={formData.ConsultationCharges}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="PKR"
        />
      ) : (
        <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
          <p className="text-gray-900">
            {user.ConsultationCharges
              ? `PKR ${user.ConsultationCharges}`
              : "Not set"}
          </p>
        </div>
      )}
    </div>

    {/* Consultation Time */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Consultation Time
      </label>
      {isEditing ? (
        <input
          type="text"
          name="ConsultationTime"
          value={formData.ConsultationTime}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. 10:00 AM - 2:00 PM"
        />
      ) : (
        <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
          <p className="text-gray-900">
            {user.ConsultationTime || "Not scheduled"}
          </p>
        </div>
      )}
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        license No:
      </label>
      {isEditing ? (
        <input
          type="text"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. 72726BS727"
        />
      ) : (
        <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
          <p className="text-gray-900">
            {user.licenseNumber || "Not Found"}
          </p>
        </div>
      )}
    </div>

    
   {/* Time Per Patient */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Time Per Patient
  </label>

  {isEditing ? (
    <select
      name="ConsultationTimePerPatient"
      value={formData.ConsultationTimePerPatient}
      onChange={handleInputChange}
      className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Select duration</option>
      <option value="5">5 minutes</option>
      <option value="10">10 minutes</option>
      <option value="15">15 minutes</option>
      <option value="20">20 minutes</option>
      <option value="30">30 minutes</option>
      <option value="40">40 minutes</option>
    </select>
  ) : (
    <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
      <p className="text-gray-900">
        {user.ConsultationTimePerPatient
          ? `${user.ConsultationTimePerPatient} minutes`
          : "Not defined"}
      </p>
    </div>
  )}
</div>



{/* Total Appointments */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Total Appointments
  </label>

  {isEditing ? (
    <input
      type="number"
      min="0"
      name="TotalAppointments"
      value={formData.TotalAppointments}
      onChange={handleInputChange}
      className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      placeholder="e.g. 50"
    />
  ) : (
    <div className="px-4 py-2.5 text-black bg-gray-50 rounded-lg">
      <p className="text-gray-900">
        {user.TotalAppointments || 0}
      </p>
    </div>
  )}
</div>


  </div>
</div>
)
}




            {/* Medical Information  */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  Medical Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Blood Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    {isEditing ? (
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                        <p className="text-gray-900">{user.bloodGroup || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Name - Phone Number"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                        <p className="text-gray-900">{user.emergencyContact || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  {/* Allergies */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies
                    </label>
                    {isEditing ? (
                      <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="List any allergies or medical conditions"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                        <p className="text-gray-900">{user.allergies || 'None reported'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          

            {/* Action Buttons (when editing) */}
            {isEditing && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-3.5 rounded-lg transition-all hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3.5 rounded-lg transition-colors border border-gray-300"
                  >
                    <X className="w-5 h-5 mr-2 inline" />
                    Cancel
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Changes will be updated immediately and reflected across the system
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-gray-500">
          Last updated: {formatDate(user.updatedAt || user.createdAt)} • 
          Account ID: {user._id?.substring(0, 8)}...
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;