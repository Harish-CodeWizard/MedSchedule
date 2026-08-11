 import React, { useState, useEffect } from 'react';
import labStore from '../../store/labStore.js'; // Updated store import
import {
  Printer, FileText, Filter, Download,
  Eye, RefreshCw, BarChart3, DollarSign,
  User, CheckCircle, Search, FlaskRound,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

function LabTest() {
  const {
    getAllLabRecord,
    labRecords,
    deleteLabRecord
  } = labStore();

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    currentPage: 1,
    totalRecords: 0,
    limit: 20
  });

  const [stats, setStats] = useState({
    totalToday: 0,
    totalAllTime: 0,
    pendingTests: 0,
    completedTests: 0,
    patientsToday: 0,
    patientsAllTime: 0
  });

  /* ================= FETCH DATA WITH PAGINATION ================= */
  const fetchLabRecords = async (page = 1, limit = recordsPerPage) => {
    setLoading(true);
    try {
      await getAllLabRecord(page, limit);
    } catch (error) {
      console.error('Error fetching lab records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabRecords();
  }, []);

  /* ================= PROCESS DATA ================= */
  useEffect(() => {
    // Check if labRecords exists and has the correct structure
    if (!labRecords || !labRecords.records || !Array.isArray(labRecords.records)) {
      console.log('No valid lab records found:', labRecords);
      setRecords([]);
      setFilteredData([]);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const recordsData = labRecords.records;
    
    // Set pagination info from API response
    if (labRecords.pagination) {
      setPaginationInfo(labRecords.pagination);
      setCurrentPage(labRecords.pagination.currentPage);
      setTotalPages(labRecords.pagination.totalPages);
      setTotalRecords(labRecords.pagination.totalRecords);
    }

    let totalToday = 0;
    let pendingTests = 0;
    let completedTests = 0;
    const patientsTodaySet = new Set();
    const patientsAllTimeSet = new Set();

    const formattedRecords = [];

    recordsData.forEach(record => {
      const isToday = record.performedDate?.startsWith(today) || 
                     record.createdAt?.startsWith(today);
      
      if (isToday) {
        totalToday++;
        if (record.patientUniqueId) {
          patientsTodaySet.add(record.patientUniqueId);
        }
      }
      
      if (record.status === 'Pending' || record.status === 'pending') {
        pendingTests++;
      }
      if (record.status === 'Completed' || record.status === 'completed') {
        completedTests++;
      }
      
      if (record.patientUniqueId) {
        patientsAllTimeSet.add(record.patientUniqueId);
      }
      
      formattedRecords.push({
        _id: record._id,
        patientId: record.patientId,
        patientName: record.patientName,
        patientUniqueId: record.patientUniqueId,
        patientAge: record.age,
        patientGender: record.gender,
        
        doctorId: record.doctorId,
        doctorName: record.doctorName,
        diagnosis: record.diagnosis,
        overallNotes: record.overallNotes,

        testName: record.testName,
        testCategory: record.category,
        priority: record.priority,
        instructions: record.instructions,
        parameters: record.parameters || [],
        
        status: record.status,
        performedBy: record.performedBy,
        performedDate: record.performedDate,
        
        recommendedDate: record.createdAt,
        completedDate: record.updatedAt,
        createdAt: record.createdAt
      });
    });

    setRecords(formattedRecords);
    setFilteredData(formattedRecords); // Initialize filteredData with all records
    setStats({
      totalToday,
      totalAllTime: paginationInfo.totalRecords || formattedRecords.length,
      pendingTests,
      completedTests,
      patientsToday: patientsTodaySet.size,
      patientsAllTime: patientsAllTimeSet.size
    });

  }, [labRecords]); // Fixed: Changed from labRecord to labRecords

  /* ================= FILTER ================= */
  useEffect(() => {
    let data = [...records];

    if (selectedDate) {
      data = data.filter(p =>
        (p.performedDate && p.performedDate.startsWith(selectedDate)) ||
        (p.createdAt && p.createdAt.startsWith(selectedDate))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p =>
        (p.patientName && p.patientName.toLowerCase().includes(q)) ||
        (p.patientUniqueId && p.patientUniqueId.toLowerCase().includes(q)) ||
        (p.doctorName && p.doctorName.toLowerCase().includes(q)) ||
        (p.testName && p.testName.toLowerCase().includes(q)) ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(q))
      );
    }

    setFilteredData(data);
  }, [records, selectedDate, searchQuery]);

  /* ================= PAGINATION CONTROLS ================= */
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchLabRecords(page, recordsPerPage);
  };


  // Calculate paginated data for local filtering
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };


  // Determine which data to display
  const displayData = filteredData.length > 0 ? 
    (filteredData.length <= totalRecords ? getPaginatedData() : records) : 
    [];

  /* ================= VIEW DETAILS ================= */
  const handleViewDetails = (record) => {
    const parametersList = record.parameters && record.parameters.length > 0 ? 
      record.parameters.map((param, index) => `
      Parameter ${index + 1}: ${param.parameter}
      Value: ${param.value} ${param.unit}
      Normal Range: ${param.normalRange}
      Flag: ${param.flag}
      Notes: ${param.notes || 'None'}
    `).join('\n') : 'No parameters available';

    alert(`🔬 Lab Test Record\n
📋 Record Information:
Patient ID: ${record.patientUniqueId}
Status: ${record.status}

👤 Patient Information:
Name: ${record.patientName}
Age: ${record.patientAge}
Gender: ${record.patientGender}

🩺 Medical Information:
Doctor: ${record.doctorName}
Diagnosis: ${record.diagnosis || 'N/A'}
Charges Details: ${record.overallNotes || 'None'}

🧪 Test Details:
Test: ${record.testName}
Category: ${record.testCategory}
Priority: ${record.priority}
Instructions: ${record.instructions || 'None'}

📊 Test Parameters:
${parametersList}

📅 Timeline:
Performed Date: ${record.performedDate ? new Date(record.performedDate).toLocaleDateString() : 'N/A'}
Completed: ${record.completedDate ? new Date(record.completedDate).toLocaleDateString() : 'Pending'}

🧑‍🔬 Lab Information:
Technician: ${record.performedBy || 'N/A'}`);
  };



  // Function to handle delete record
const handleDeleteRecord = async (recordId) => {
  if (!window.confirm('Are you sure you want to delete this lab record? This action cannot be undone.')) {
    return;
  }

  try {
    setLoading(true);
    // Call delete function from store
    await deleteLabRecord(recordId);
    
    // Refresh the records after deletion
    fetchLabRecords(currentPage, recordsPerPage);
    
    toast.success('Lab record deleted successfully!');
  } catch (error) {
    console.error('Error deleting lab record:', error);
    toast.error('Error deleting lab record. Please try again.');
  } finally {
    setLoading(false);
  }
};



  /* ================= PRINT REPORT ================= */
  const handlePrintReport = (record) => {
    try {
      const parametersHTML = record.parameters && record.parameters.length > 0 ? 
        record.parameters.map(param => `
        <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <strong>${param.parameter || 'N/A'}</strong>
            <span style="color: ${
              param.flag === 'Critical' ? '#dc2626' : 
              param.flag === 'High' ? '#ea580c' : 
              param.flag === 'Low' ? '#3b82f6' : 
              '#059669'
            }">
              ${param.flag || 'Normal'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span>Value: ${param.value || 'N/A'} ${param.unit || ''}</span>
            <span>Range: ${param.normalRange || 'N/A'}</span>
          </div>
          ${param.notes ? `<div style="font-size: 13px; color: #6b7280; margin-top: 5px;">Notes: ${param.notes}</div>` : ''}
        </div>
      `).join('') : '<div style="padding: 10px 0; color: #666;">No parameters available</div>';

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lab Test Report - ${record.patientUniqueId}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
              color: #333;
              background: #f8f9fa;
            }
            .report-container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              padding: 20px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .header h2 { 
              color: white; 
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .info-section {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 15px;
              border: 1px solid #e2e8f0;
            }
            .test-details {
              background: #fff7ed;
              border: 1px solid #fed7aa;
            }
            .result-section {
              background: #f0f9ff;
              border: 1px solid #bae6fd;
            }
            .parameters-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .parameters-table th {
              background: #3b82f6;
              color: white;
              padding: 8px;
              text-align: left;
            }
            .parameters-table td {
              padding: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .flag-critical { color: #dc2626; font-weight: bold; }
            .flag-high { color: #ea580c; }
            .flag-low { color: #3b82f6; }
            .flag-normal { color: #059669; }
            .footer {
              text-align: center;
              color: #64748b;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
            }
            @media print {
              body { padding: 10px; background: white; }
              .no-print { display: none; }
              .header { background: #3b82f6 !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h2>LABORATORY TEST REPORT</h2>
              <div>Report #${record._id}</div>
            </div>
            
            <div class="info-section">
              <h3 style="color: #3b82f6; margin-top: 0;">Patient Information</h3>
              <p><strong>Name:</strong> ${record.patientName}</p>
              <p><strong>Patient ID:</strong> ${record.patientUniqueId}</p>
              <p><strong>Age:</strong> ${record.patientAge} | <strong>Gender:</strong> ${record.patientGender}</p>
            </div>
            
            <div class="info-section">
              <h3 style="color: #3b82f6; margin-top: 0;">Referring Physician</h3>
              <p><strong>Doctor:</strong> Dr. ${record.doctorName}</p>
              <p><strong>Diagnosis:</strong> ${record.diagnosis || 'N/A'}</p>
              <p><strong>Charges Detail:</strong> ${record.overallNotes || 'None'}</p>
            </div>
            
            <div class="info-section test-details">
              <h3 style="color: #ea580c; margin-top: 0;">Test Details</h3>
              <p><strong>Test Name:</strong> ${record.testName}</p>
              <p><strong>Category:</strong> ${record.testCategory}</p>
              <p><strong>Priority:</strong> <span style="color: ${record.priority === 'Emergency' ? '#dc2626' : record.priority === 'Urgent' ? '#ea580c' : '#3b82f6'}">${record.priority}</span></p>
              <p><strong>Instructions:</strong> ${record.instructions || 'None'}</p>
            </div>
            
            <div class="info-section result-section">
              <h3 style="color: #059669; margin-top: 0;">Test Results</h3>
              <p><strong>Status:</strong> <span style="color: ${record.status === 'Completed' ? '#059669' : '#ea580c'}">${record.status}</span></p>
              
              <h4 style="margin-top: 15px; margin-bottom: 10px; color: #4b5563;">Parameters:</h4>
              ${parametersHTML}
              
              <div style="margin-top: 15px;">
                <p><strong>Lab Technician:</strong> ${record.performedBy || 'N/A'}</p>
                <p><strong>Performed Date:</strong> ${record.performedDate ? new Date(record.performedDate).toLocaleString() : 'N/A'}</p>
                <p><strong>Report Date:</strong> ${record.completedDate ? new Date(record.completedDate).toLocaleString() : new Date().toLocaleString()}</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Hospital Management System - Laboratory Department</p>
              <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p style="font-size: 10px; color: #94a3b8;">This is a computer generated report</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 40px;">
            <button onclick="window.print()" style="
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 5px; 
              cursor: pointer;
              margin-right: 10px;
            ">
              Print Report
            </button>
            <button onclick="window.close()" style="
              background: #dc2626;
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 5px; 
              cursor: pointer;
            ">
              Close
            </button>
          </div>
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        alert('Please allow popups to print report');
        return;
      }
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = function() {
        printWindow.focus();
      };
      
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Error printing report');
    }
  };

  /* ================= EXPORT DATA ================= */
  const handleExportData = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : records;
    
    if (dataToExport.length === 0) {
      alert('No data available to export');
      return;
    }

    const csv = [
      ['Patient Name', 'Patient ID', 'Test Name', 'Category', 'Doctor', 'Diagnosis', 'Priority', 'Status', 'Performed By', 'Performed Date', 'Report Date'],
      ...dataToExport.map(p => [
        p.patientName || '',
        p.patientUniqueId || '',
        p.testName || '',
        p.testCategory || '',
        p.doctorName || '',
        p.diagnosis || '',
        p.priority || '',
        p.status || '',
        p.performedBy || '',
        p.performedDate ? new Date(p.performedDate).toLocaleDateString() : 'N/A',
        p.completedDate ? new Date(p.completedDate).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lab_records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FlaskRound className="w-8 h-8 text-blue-600" />
                Laboratory Records & Test History
              </h1>
              <p className="text-gray-600 mt-1">
                View all recommended and completed laboratory tests
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={() => fetchLabRecords(currentPage, recordsPerPage)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleExportData}
                disabled={records.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <FlaskRound className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{paginationInfo.totalRecords || 0}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Today: {stats.totalToday}
              </div>
            </div>
{/* 
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.pendingTests}</div>
                  <div className="text-sm text-gray-600">Pending Tests</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Status: Active
              </div>
            </div> */}

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.completedTests}</div>
                  <div className="text-sm text-gray-600">Completed Tests</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Ready for review
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-500 text-white">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.patientsAllTime}</div>
                  <div className="text-sm text-gray-600">Total Patients</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Today: {stats.patientsToday}
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  Filter Lab Records
                </h3>
                <p className="text-gray-600 text-sm">Search and filter laboratory test records</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search patient, test, doctor..."
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => setSelectedDate('')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    All Dates
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FlaskRound className="w-5 h-5 text-blue-600" />
                    Laboratory Test Records
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({filteredData.length} records)
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Page {currentPage} of {totalPages} • Total: {totalRecords} records
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                 
                  
                  <div className="text-sm text-gray-600">
                    Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading laboratory records...</p>
              </div>
            ) : displayData.length === 0 ? (
              <div className="p-12 text-center">
                <FlaskRound className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No laboratory records found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedDate ? `for ${selectedDate}` : searchQuery ? `matching "${searchQuery}"` : ''}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient Information
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayData.map((record, index) => (
                        <tr key={record._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {record.patientName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {record.patientUniqueId}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {record.patientAge} yrs • {record.patientGender}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {record.testName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.testCategory}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                                record.priority === 'Emergency' 
                                  ? 'bg-red-100 text-red-800' 
                                  : record.priority === 'Urgent'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {record.priority}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Dr. {record.doctorName}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {record.diagnosis || 'N/A'}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                              record.status === 'Completed' || record.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'In Progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {record.performedDate ? new Date(record.performedDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.parameters?.length || 0} parameters
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(record)}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handlePrintReport(record)}
                                disabled={record.status !== 'Completed' && record.status !== 'completed'}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={record.status !== 'Completed' ? 'Only completed tests can be printed' : 'Print report'}
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                               <button
      onClick={() => handleDeleteRecord(record._id)}
      disabled={loading}
      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete Record"
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

                {/* Pagination Controls */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {Math.min(displayData.length, recordsPerPage)} of {filteredData.length} records
                      {filteredData.length > 0 && filteredData.length !== records.length && ' (filtered)'}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded-lg ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabTest;