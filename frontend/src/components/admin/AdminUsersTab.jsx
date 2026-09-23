import React from 'react';
import { User } from 'lucide-react';

const AdminUsersTab = ({ allUsers, formatDate }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Users ({allUsers?.length || 0})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allUsers?.map(user => (
          <div key={user._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-3">
              <div className={`p-3 rounded-lg ${
                user.role === "Doctor" ? "bg-blue-100" : 
                user.role === "Admin" ? "bg-purple-100" : 
                user.role === "Reception" ? "bg-green-100" : 
                user.role === "Lab" ? "bg-orange-100" :
                user.role === "X-Ray" ? "bg-red-100" :
                "bg-gray-100"
              }`}>
                <User className="w-6 h-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-lg">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
                  user.role === "Doctor" ? "bg-blue-100 text-blue-800" : 
                  user.role === "Admin" ? "bg-purple-100 text-purple-800" : 
                  user.role === "Reception" ? "bg-green-100 text-green-800" :
                  user.role === "Lab" ? "bg-orange-100 text-orange-800" :
                  user.role === "X-Ray" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Phone: {user.phone}</p>
              <p>Verified: {user.verified ? "✅ Yes" : "❌ No"}</p>
              {user.licenseNumber && <p>License: {user.licenseNumber}</p>}
              <p className="text-xs text-gray-500">Joined: {formatDate(user.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersTab;
