import React, { useEffect } from 'react';
import {
  X,
  Pill,
  Package,
  User,
  Phone,
  Calendar,
  DollarSign,
  Printer,
  Stethoscope,
  FileText,
  CheckCircle,
  Clock,
  Store,
  Bike,
  MapPin,
  Tag
} from 'lucide-react';

function PharmacyDetailsModal({ isOpen, onClose, record, onPrint, type }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const isPrescription = type === 'prescription' || (!type && !!(record.doctorName || record.patientAge));
  const recordId = record.patientUniqueId || record.recordId || record.uniqueID || 'N/A';
  const recordDate = record.completedDate || record.createdAt || record.prescribedDate;
  const medicines = record.medicines || [];
  const charges = Number(record.charges) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white text-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isPrescription ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              }`}
            >
              {isPrescription ? (
                <Pill className="w-6 h-6" />
              ) : (
                <Package className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {isPrescription
                  ? 'Prescription Record Details'
                  : 'Walk-in Pharmacy Record Details'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record ID: <span className="font-semibold text-slate-700">{recordId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto bg-white">
          {/* Top Banner Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Record ID
                </span>
                <p className="font-bold text-slate-900 font-mono mt-0.5">{recordId}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Date & Time
                </span>
                <p className="text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {recordDate ? new Date(recordDate).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Dispensed By
                </span>
                <p className="text-slate-800 font-medium mt-0.5">
                  {record.PharmacyPerson || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </span>
                <div className="mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {record.status || 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer / Patient Information */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              {isPrescription ? 'Patient Information' : 'Customer Information'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-500">Full Name</span>
                <p className="font-semibold text-slate-900">{record.patientName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Phone Number</span>
                <p className="text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {record.patientPhone || 'N/A'}
                </p>
              </div>
              {isPrescription && (
                <>
                  <div>
                    <span className="text-xs text-slate-500">Age</span>
                    <p className="text-slate-800">{record.patientAge || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Gender</span>
                    <p className="text-slate-800">{record.patientGender || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Medical Information (Prescription only) */}
          {isPrescription && (
            <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                Medical & Consultation Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500">Doctor Name</span>
                  <p className="font-semibold text-slate-900">{record.doctorName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Specialization</span>
                  <p className="text-slate-800">{record.specialist || 'General'}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-500">Diagnosis</span>
                  <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                    {record.diagnosis || 'No diagnosis recorded'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fulfillment details (Prescription only) */}
          {isPrescription && record.fulfillmentMethod && (
            <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                {record.fulfillmentMethod === 'delivery' ? (
                  <Bike className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Store className="w-4 h-4 text-indigo-600" />
                )}
                Fulfillment Option
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500">Method</span>
                  <p className="font-medium text-slate-900 capitalize flex items-center gap-1.5 mt-0.5">
                    {record.fulfillmentMethod === 'delivery' ? 'Home Delivery' : 'Pharmacy Takeaway'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Fulfillment Status</span>
                  <p className="font-medium text-slate-900 capitalize mt-0.5">
                    {record.fulfillmentStatus ? record.fulfillmentStatus.replace(/_/g, ' ') : 'Completed'}
                  </p>
                </div>
                {record.fulfillmentMethod === 'delivery' && record.deliveryAddress && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Delivery Address
                    </span>
                    <p className="text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 text-xs">
                      {record.deliveryAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medicines Dispensed */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-600" />
                Medicines Dispensed ({medicines.length})
              </h3>
            </div>
            {medicines.length > 0 ? (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">
                          {med.medicineName || 'Unnamed Medicine'}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                          <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md">
                            Qty: {med.quantity || 1}
                          </span>
                          {med.dosage && (
                            <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
                              {med.dosage}
                            </span>
                          )}
                          {med.frequency && (
                            <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
                              {med.frequency}
                            </span>
                          )}
                          {med.duration && (
                            <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
                              {med.duration} days
                            </span>
                          )}
                          {med.timing && (
                            <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
                              {med.timing}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-slate-900">
                          PKR {med.pharmacyCharges ? Number(med.pharmacyCharges).toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm py-2">No medicines listed</p>
            )}
          </div>

          {/* Charges Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-900">Total Charges</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">
              PKR {charges.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            {onPrint && (
              <button
                type="button"
                onClick={() => onPrint(record)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PharmacyDetailsModal;
