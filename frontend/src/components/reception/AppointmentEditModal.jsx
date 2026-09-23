import React from 'react';
import { X } from 'lucide-react';

const AppointmentEditModal = ({
  isOpen,
  patient,
  appointmentForm,
  onFormChange,
  onSubmit,
  onClose,
  onRemove,
  doctors = [],
  appointmentStatuses = ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled']
}) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {patient.doctorAppointment ? 'Edit Appointment' : 'Add Appointment'}
              </h2>
              <p className="text-sm text-gray-600">Patient: {patient.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor *
                </label>
                <select
                  name="doctorId"
                  value={appointmentForm.doctorId}
                  onChange={onFormChange}
                  className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option 
                      key={doctor._id} 
                      value={doctor._id}
                      disabled={!doctor.isAvailable}
                      className={!doctor.isAvailable ? 'text-gray-400' : ''}
                    >
                      Dr. {doctor.name} - PKR {doctor.ConsultationCharges || 0}
                      {doctor.isAvailable 
                        ? doctor.TotalAppointments 
                          ? ` (Slots: ${doctor.remainingSlots}/${doctor.TotalAppointments})`
                          : ' (Available)'
                        : ' (FULL - No Slots Available)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Doctors with no available slots are disabled
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={appointmentForm.appointmentDate}
                  onChange={onFormChange}
                  className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charges (PKR) *
                </label>
                <input
                  type="number"
                  name="charges"
                  value={appointmentForm.charges}
                  readOnly
                  className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Auto-filled from doctor's charges"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Charges are automatically set from selected doctor's consultation fees
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={appointmentForm.status}
                  onChange={onFormChange}
                  className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                >
                  {appointmentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                
                {patient.doctorAppointment && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg"
                >
                  {patient.doctorAppointment ? 'Update' : 'Add Appointment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentEditModal;
