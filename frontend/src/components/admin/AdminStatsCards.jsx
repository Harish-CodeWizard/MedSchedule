import React from 'react';
import { Users, UserCheck, Briefcase } from 'lucide-react';

const AdminStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
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
            <UserCheck className="w-6 h-6 text-green-600" />
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
            <Briefcase className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-700">Staff Category</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCards;
