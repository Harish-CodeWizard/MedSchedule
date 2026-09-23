import React from 'react';
import { X, User, Phone, Stethoscope, Clock, Edit, Calendar, Download } from 'lucide-react';
import InfoRow from '../common/InfoRow.jsx';

const PatientDetailsModal = ({
  isOpen,
  patient,
  onClose,
  onEdit,
  onEditAppointment,
  onExportData,
  getDoctorName
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
              <p className="text-gray-600">Comprehensive information for {patient.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {patient.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-gray-600">
                    <span className="text-black font-bold"> ID: </span>{patient.uniqueID || patient._id?.substring(0, 8)}
                    <div>
                      <span className="text-black font-bold">AppointmentNumber: </span>
                      {patient.doctorAppointment?.appointmentNumber || 'No Appointment'}
                    </div>
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Personal Information
                </h4>
                <InfoRow label="Full Name" value={patient.name} />
                <InfoRow label="Gender" value={patient.gender || 'Not specified'} />
                <InfoRow label="Age" value={patient.age || 'Not provided'} />
                <InfoRow label="Weight" value={patient.weight ? `${patient.weight} kg` : 'Not provided'} />
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  Contact Information
                </h4>
                <InfoRow label="Phone" value={patient.phone || 'Not provided'} />
                <InfoRow label="Address" value={patient.address || 'Not provided'} />
                <InfoRow label="Blood Group" value={patient.bloodGroup || 'Not tested'} />
              </div>
            </div>

            {/* Appointment Information */}
            {patient.doctorAppointment && patient.doctorAppointment.doctorId ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-amber-600" />
                  Appointment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Doctor Name" value={patient.doctorAppointment.doctorName || getDoctorName(patient.doctorAppointment.doctorId)} />
                  <InfoRow label="Charges" value={`PKR ${patient.doctorAppointment.charges || 0}`} />
                  <InfoRow label="Appointment Date" value={new Date(patient.doctorAppointment.appointmentDate).toLocaleDateString()} />
                  <InfoRow label="Status" value={patient.doctorAppointment.status || 'Pending'} />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-600 text-center">
                  No appointment assigned to this patient
                </p>
              </div>
            )}

            {/* System Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                System Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Registration Date" value={new Date(patient.createdAt).toLocaleDateString()} />
                <InfoRow label="Last Updated" value={new Date(patient.updatedAt || patient.createdAt).toLocaleDateString()} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onEdit(patient)}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Patient
              </button>
              <button
                type="button"
                onClick={() => onEditAppointment(patient)}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                {patient.doctorAppointment ? 'Edit Appointment' : 'Add Appointment'}
              </button>
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
