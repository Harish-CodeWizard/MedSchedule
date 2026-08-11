import React, { useState, useEffect } from 'react';
import xrayStore from '../../store/xrayStore.js';
import {
  Printer, FileText, Filter, Download,
  Eye, RefreshCw, BarChart3, Image, Camera,
  User, CheckCircle, Search, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Trash2, X
} from 'lucide-react';
import toast from 'react-hot-toast';

function XrayTest() {
  const {
    getAllXrayRecord,
    xrayRecords,
    deleteXrayRecord
  } = xrayStore();

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
    patientsToday: 0,
    patientsAllTime: 0,
    totalImages: 0
  });

  // Image preview state
  const [previewImage, setPreviewImage] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  /* ================= FETCH DATA WITH PAGINATION ================= */
  const fetchXrayRecords = async (page = 1, limit = recordsPerPage) => {
    setLoading(true);
    try {
      const result = await getAllXrayRecord(page, limit);
      console.log('Fetched x-ray records:', result);
    } catch (error) {
      console.error('Error fetching x-ray records:', error);
      toast.error('Failed to fetch x-ray records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXrayRecords();
  }, []);

  /* ================= PROCESS DATA ================= */
  useEffect(() => {
    console.log('xrayRecords from store:', xrayRecords);
    
    // Check if xrayRecords exists and has the correct structure
    if (!xrayRecords || !Array.isArray(xrayRecords.records) || xrayRecords.records.length === 0) {
      // Check if xrayRecords is directly an array
      if (Array.isArray(xrayRecords) && xrayRecords.length > 0) {
        console.log('xrayRecords is direct array');
        processXrayRecords(xrayRecords);
        return;
      }
      console.log('No valid x-ray records found:', xrayRecords);
      setRecords([]);
      setFilteredData([]);
      return;
    }

    // If xrayRecords has records and pagination structure
    if (xrayRecords.records && xrayRecords.pagination) {
      processXrayRecords(xrayRecords.records);
      setPaginationInfo(xrayRecords.pagination);
      setCurrentPage(xrayRecords.pagination.currentPage);
      setTotalPages(xrayRecords.pagination.totalPages);
      setTotalRecords(xrayRecords.pagination.totalRecords);
    }

  }, [xrayRecords]);

  const processXrayRecords = (recordsData) => {
    const today = new Date().toISOString().split('T')[0];
    
    let totalToday = 0;
    let totalImages = 0;
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
      
      // Count total images
      if (record.records && Array.isArray(record.records)) {
        totalImages += record.records.length;
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
        
        // X-RAY SPECIFIC: records array
        records: record.records || [],
        
        status: record.status,
        performedBy: record.performedBy,
        performedDate: record.performedDate,
        
        recommendedDate: record.createdAt,
        completedDate: record.updatedAt,
        createdAt: record.createdAt
      });
    });

    setRecords(formattedRecords);
    setFilteredData(formattedRecords);
    setStats({
      totalToday,
      totalAllTime: formattedRecords.length,
      patientsToday: patientsTodaySet.size,
      patientsAllTime: patientsAllTimeSet.size,
      totalImages
    });
  };

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
    fetchXrayRecords(page, recordsPerPage);
  };

  const handleRecordsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setRecordsPerPage(newLimit);
    setCurrentPage(1);
    fetchXrayRecords(1, newLimit);
  };

  // Calculate paginated data for local filtering
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Determine which data to display
  const displayData = filteredData.length > 0 ? 
    getPaginatedData() : 
    [];

  /* ================= VIEW X-RAY DETAILS ================= */
  const handleViewDetails = (record) => {
    setViewingRecord(record);
    
    const imagesList = record.records && record.records.length > 0 ? 
      record.records.map((img, index) => `
      Image ${index + 1}: 
      Note: ${img.note || 'No note'}
      ${img.image.startsWith('data:image') ? 'Base64 Image' : `File: ${img.image}`}
    `).join('\n') : 'No images available';

    alert(`📷 X-ray Record\n
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

📸 X-ray Images:
${record.records ? `${record.records.length} image(s)` : '0 images'}

${imagesList}

📅 Timeline:
Performed Date: ${record.performedDate ? new Date(record.performedDate).toLocaleDateString() : 'N/A'}
Completed: ${record.completedDate ? new Date(record.completedDate).toLocaleDateString() : 'Pending'}

🧑‍🔬 X-ray Technician:
${record.performedBy || 'N/A'}`);
  };

  /* ================= VIEW X-RAY IMAGES ================= */
  const handleViewImages = (record) => {
    setViewingRecord(record);
    if (record.records && record.records.length > 0) {
      // Show first image
      setPreviewImage(record.records[0].image);
      setSelectedImageIndex(0);
    } else {
      alert('No images available for this x-ray record');
    }
  };

  /* ================= NAVIGATE IMAGES IN PREVIEW ================= */
  const handleNextImage = () => {
    if (!viewingRecord || !viewingRecord.records) return;
    
    const nextIndex = (selectedImageIndex + 1) % viewingRecord.records.length;
    setSelectedImageIndex(nextIndex);
    setPreviewImage(viewingRecord.records[nextIndex].image);
  };

  const handlePrevImage = () => {
    if (!viewingRecord || !viewingRecord.records) return;
    
    const prevIndex = selectedImageIndex === 0 
      ? viewingRecord.records.length - 1 
      : selectedImageIndex - 1;
    setSelectedImageIndex(prevIndex);
    setPreviewImage(viewingRecord.records[prevIndex].image);
  };

  /* ================= DELETE X-RAY RECORD ================= */
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this x-ray record? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteXrayRecord(recordId);
      
      // Refresh the records after deletion
      fetchXrayRecords(currentPage, recordsPerPage);
      
      toast.success('X-ray record deleted successfully!');
    } catch (error) {
      console.error('Error deleting x-ray record:', error);
      toast.error('Error deleting x-ray record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRINT X-RAY REPORT ================= */
  const handlePrintReport = (record) => {
    try {
      const imagesHTML = record.records && record.records.length > 0 ? 
        record.records.map((img, index) => `
        <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0; margin-bottom: 10px;">
          <h4 style="color: #3b82f6; margin-bottom: 5px;">Image ${index + 1}</h4>
          ${img.note ? `<p style="margin-bottom: 8px;"><strong>Note:</strong> ${img.note}</p>` : ''}
          ${img.image.startsWith('data:image') ? 
            `<div style="background: #f3f4f6; padding: 10px; border-radius: 5px; margin-top: 5px;">
              <p style="color: #6b7280; font-size: 14px;">Base64 Image (Embedded)</p>
            </div>` : 
            `<div style="text-align: center; margin: 15px 0;">
              <img 
                src="${img.image}" 
                alt="X-ray Image ${index + 1}" 
                style="max-width: 100%; max-height: 300px; border: 1px solid #e5e7eb; border-radius: 5px;"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<p style=\\'color: #dc2626\\'>Image not available</p>';"
              />
              ${img.filename ? `<p style="font-size: 12px; color: #6b7280; margin-top: 5px;">${img.filename}</p>` : ''}
            </div>`
          }
        </div>
      `).join('') : '<div style="padding: 10px 0; color: #666;">No x-ray images available</div>';

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>X-ray Report - ${record.patientUniqueId}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
              color: #333;
              background: #f8f9fa;
            }
            .report-container {
              max-width: 800px;
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
            .xray-images {
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              margin-top: 20px;
            }
            .image-item {
              padding: 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            .image-item:last-child {
              border-bottom: none;
            }
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
              img { max-width: 100% !important; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h2>X-RAY REPORT</h2>
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
              <p><strong>Doctor:</strong> ${record.doctorName}</p>
              <p><strong>Diagnosis:</strong> ${record.diagnosis || 'N/A'}</p>
              <p><strong>Charges:</strong> ${record.overallNotes || 'None'}</p>
            </div>
            
            <div class="info-section">
              <h3 style="color: #3b82f6; margin-top: 0;">X-ray Details</h3>
              <p><strong>Test Name:</strong> ${record.testName}</p>
              <p><strong>Category:</strong> ${record.testCategory}</p>
              <p><strong>Priority:</strong> <span style="color: ${record.priority === 'Emergency' ? '#dc2626' : record.priority === 'Urgent' ? '#ea580c' : '#3b82f6'}">${record.priority}</span></p>
              <p><strong>Instructions:</strong> ${record.instructions || 'None'}</p>
            </div>
            
            <div class="info-section xray-images">
              <h3 style="color: #059669; margin-top: 0;">X-ray Images</h3>
              <p><strong>Total Images:</strong> ${record.records ? record.records.length : 0}</p>
              <p><strong>Status:</strong> <span style="color: ${record.status === 'Completed' ? '#059669' : '#ea580c'}">${record.status}</span></p>
              
              <div style="margin-top: 15px;">
                <h4 style="color: #4b5563; margin-bottom: 10px;">Images:</h4>
                ${imagesHTML}
              </div>
              
              <div style="margin-top: 15px;">
                <p><strong>X-ray Technician:</strong> ${record.performedBy || 'N/A'}</p>
                <p><strong>Performed Date:</strong> ${record.performedDate ? new Date(record.performedDate).toLocaleString() : 'N/A'}</p>
                <p><strong>Report Date:</strong> ${record.completedDate ? new Date(record.completedDate).toLocaleString() : new Date().toLocaleString()}</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Hospital Management System - Radiology Department</p>
              <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p style="font-size: 10px; color: #94a3b8;">This is a computer generated x-ray report</p>
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
      ['Patient Name', 'Patient ID', 'Test Name', 'Category', 'Doctor', 'Diagnosis', 'Priority', 'Status', 'X-ray Technician', 'Images Count', 'Performed Date', 'Report Date'],
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
        p.records ? p.records.length : 0,
        p.performedDate ? new Date(p.performedDate).toLocaleDateString() : 'N/A',
        p.completedDate ? new Date(p.completedDate).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `xray_records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
      {/* Image Preview Modal */}
      {previewImage && viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  X-ray Images - {viewingRecord.patientName} ({viewingRecord.testName})
                </h3>
                <p className="text-sm text-gray-600">
                  Image {selectedImageIndex + 1} of {viewingRecord.records.length}
                  {viewingRecord.records[selectedImageIndex].note && 
                    ` - ${viewingRecord.records[selectedImageIndex].note}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setPreviewImage(null);
                  setViewingRecord(null);
                  setSelectedImageIndex(0);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Main Image Display */}
            <div className="flex-1 flex flex-col md:flex-row p-4 overflow-hidden">
              {/* Image Navigation & Thumbnails */}
              <div className="md:w-1/5 mb-4 md:mb-0 md:mr-4">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {viewingRecord.records.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setPreviewImage(img.image);
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">
                        Image {index + 1}
                      </div>
                      {img.filename && (
                        <div className="text-xs text-gray-500 truncate mb-1">
                          {img.filename}
                        </div>
                      )}
                      {img.note && (
                        <div className="text-xs text-gray-600 truncate">
                          {img.note}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Main Image Viewer */}
              <div className="md:w-4/5 flex flex-col">
                <div className="flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt={`X-ray Image ${selectedImageIndex + 1}`}
                    className="max-w-full max-h-[60vh] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                    }}
                  />
                </div>
                
                {/* Image Controls */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={handlePrevImage}
                    disabled={viewingRecord.records.length <= 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600">
                      {viewingRecord.records[selectedImageIndex].filename || `Image ${selectedImageIndex + 1}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {viewingRecord.records.length} total images
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNextImage}
                    disabled={viewingRecord.records.length <= 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p><strong>Patient:</strong> {viewingRecord.patientName} ({viewingRecord.patientUniqueId})</p>
                <p><strong>Test:</strong> {viewingRecord.testName} • <strong>Priority:</strong> {viewingRecord.priority}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(previewImage, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Full Size
                </button>
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setViewingRecord(null);
                    setSelectedImageIndex(0);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Camera className="w-8 h-8 text-blue-600" />
                X-ray Records & History
              </h1>
              <p className="text-gray-600 mt-1">
                View all x-ray imaging records
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={() => fetchXrayRecords(currentPage, recordsPerPage)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalToday}</div>
                  <div className="text-sm text-gray-600">Today's X-rays</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <Image className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalImages}</div>
                  <div className="text-sm text-gray-600">Total Images</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Across all x-rays
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-500 text-white">
                  <CheckCircle className="w-6 h-6" />
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalAllTime}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                All time records
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-500 text-white">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.patientsToday}</div>
                  <div className="text-sm text-gray-600">Patients Today</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Seen today
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  Filter X-ray Records
                </h3>
                <p className="text-gray-600 text-sm">Search and filter x-ray imaging records</p>
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
                    <Camera className="w-5 h-5 text-blue-600" />
                    X-ray Records
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({filteredData.length} records)
                    </span>
                  </h3>
                  
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={recordsPerPage}
                      onChange={handleRecordsPerPageChange}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">per page</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading x-ray records...</p>
              </div>
            ) : displayData.length === 0 ? (
              <div className="p-12 text-center">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No x-ray records found</p>
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
                          X-ray Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Images
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
                                {record.doctorName}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {record.diagnosis || 'N/A'}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-gray-900">
                                {record.records ? record.records.length : 0} images
                              </span>
                              {record.records && record.records.length > 0 && (
                                <button
                                  onClick={() => handleViewImages(record)}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View images
                                </button>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {record.performedDate ? new Date(record.performedDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.performedDate ? new Date(record.performedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(record)}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handlePrintReport(record)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                                title="Print Report"
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

export default XrayTest;