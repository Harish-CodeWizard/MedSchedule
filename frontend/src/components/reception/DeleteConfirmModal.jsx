import React from 'react';
import { AlertCircle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, patient, onConfirm, onClose }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete Patient</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{patient.name}</span>? 
            This action cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all hover:shadow-lg"
            >
              Delete Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
