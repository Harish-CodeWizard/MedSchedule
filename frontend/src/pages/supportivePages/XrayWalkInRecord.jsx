import React, { useState, useEffect } from 'react';
import { 
  Search, User, FileText, Eye, Trash2, 
  Download, Filter, Calendar, Phone, Mail,
  AlertCircle, CheckCircle, Clock, Image, 
  ChevronLeft, ChevronRight, ExternalLink,
  Printer, Copy, X, ZoomIn, Tag, DollarSign,
  MessageSquare
} from 'lucide-react';
import xrayStore from '../../store/xrayStore';
import toast from 'react-hot-toast';

function WalkInXrayRecords() {
  const { 
    getAllWalkInXrayRecords, 
    deleteWalkInXrayRecord,
    searchWalkInXrayRecords,
    getWalkInXrayStatistics 
  } = xrayStore();
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
    priority: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 15
  });
  const [statistics, setStatistics] = useState({
    totalWalkInXrays: 0,
    todayWalkInXrays: 0,
    monthlyStats: [],
    categories: []
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    fetchRecords();
    fetchStatistics();
  }, [pagination.currentPage]);

const fetchRecords = async () => {
  setLoading(true);
  try {
    // Use the walk-in specific function
    const result = await getAllWalkInXrayRecords(
      pagination.currentPage, 
      pagination.limit,
      {
        search: searchQuery,
        ...filters
      }
    );
    
    if (result.records) {
      setRecords(result.records);
      setPagination(result.pagination);
    }
  } catch (error) {
    console.error("Error fetching walk-in records:", error);
    toast.error("Failed to fetch records");
  } finally {
    setLoading(false);
  }
};

const fetchStatistics = async () => {
  try {
    const stats = await getWalkInXrayStatistics();
    console.log("Statistics API Response:", stats); // Debug log
    
    if (stats && stats.data) {
      // Response structure: { success: true, data: { totalRecords: 2, todayRecords: 2, ... } }
      setStatistics({
        totalWalkInXrays: stats.data.totalRecords || 0,
        todayWalkInXrays: stats.data.todayRecords || 0,
        monthlyStats: stats.data.monthlyStats || [],
        categories: stats.data.categoryStats || []
      });
    } else if (stats) {
      // If stats directly contains the data
      setStatistics({
        totalWalkInXrays: stats.totalRecords || 0,
        todayWalkInXrays: stats.todayRecords || 0,
        monthlyStats: stats.monthlyStats || [],
        categories: stats.categoryStats || []
      });
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
    // Set default values
    setStatistics({
      totalWalkInXrays: 0,
      todayWalkInXrays: 0,
      monthlyStats: [],
      categories: []
    });
  }
};

const handleSearch = async () => {
  setLoading(true);
  setPagination(prev => ({ ...prev, currentPage: 1 }));
  
  try {
    const result = await searchWalkInXrayRecords(searchQuery, {
      ...filters,
      page: 1
    });
    
    if (result.records) {
      setRecords(result.records);
      setPagination(result.pagination);
    }
  } catch (error) {
    console.error("Error searching records:", error);
    toast.error("Search failed");
  } finally {
    setLoading(false);
  }
};

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      dateFrom: '',
      dateTo: '',
      category: '',
      priority: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchRecords();
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (recordToDelete) {
      const success = await deleteWalkInXrayRecord(recordToDelete._id);
      if (success) {
        fetchRecords();
        fetchStatistics();
      }
    }
    setShowDeleteModal(false);
    setRecordToDelete(null);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const handleViewImage = (image, index) => {
    setSelectedImage(image);
    setImageIndex(index);
    setShowImageModal(true);
  };

  const handleNextImage = () => {
    if (selectedRecord && selectedRecord.images) {
      const nextIndex = (imageIndex + 1) % selectedRecord.images.length;
      setSelectedImage(selectedRecord.images[nextIndex]);
      setImageIndex(nextIndex);
    }
  };

  const handlePrevImage = () => {
    if (selectedRecord && selectedRecord.images) {
      const prevIndex = (imageIndex - 1 + selectedRecord.images.length) % selectedRecord.images.length;
      setSelectedImage(selectedRecord.images[prevIndex]);
      setImageIndex(prevIndex);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'emergency':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Emergency
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Urgent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Routine
          </span>
        );
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      chest: 'bg-blue-100 text-blue-800',
      abdomen: 'bg-purple-100 text-purple-800',
      spine: 'bg-amber-100 text-amber-800',
      skull: 'bg-gray-100 text-gray-800',
      extremities: 'bg-indigo-100 text-indigo-800',
      dental: 'bg-cyan-100 text-cyan-800',
      mammography: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard!', {
    duration: 2000,
    position: 'top-right'
  });
};

  const exportToCSV = () => {
    // Simple CSV export implementation
    const headers = ['ID', 'Name', 'Age', 'Gender', 'Phone', 'Test Name', 'Category', 'Priority', 'Date', 'Technician'];
    const csvData = records.map(record => [
      record.patientUniqueId,
      record.patientName,
      record.age,
      record.gender,
      record.phone || 'N/A',
      record.testName,
      record.category,
      record.priority,
      formatDate(record.createdAt),
      record.performedBy
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `walkin-xray-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };


  const printRecord = (record) => {
  const printWindow = window.open('', '_blank');
  
  // Generate HTML for images - both thumbnails and full images
  const imagesHTML = record.images.map((img, idx) => `
    <div class="image-container" style="page-break-inside: avoid; margin-bottom: 20px;">
      <div class="image-info" style="margin-bottom: 10px;">
        <h4 style="margin: 0 0 5px 0;">Image ${idx + 1} - ${img.filename}</h4>
        ${img.note ? `<p style="margin: 0; font-style: italic; color: #666;">Note: ${img.note}</p>` : ''}
      </div>
      <img 
        src="${img.image}" 
        alt="X-ray Image ${idx + 1}" 
        style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;"
        onload="this.classList.add('loaded')"
        onerror="this.style.display='none'; this.parentElement.innerHTML+='<p style=color:red>Image failed to load</p>'"
      />
      <p style="margin-top: 5px; font-size: 11px; color: #777;">
        Cloudinary ID: ${img.cloudinary_id} | Size: ${(img.size || 0).toLocaleString()} bytes
      </p>
    </div>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>X-ray Report - ${record.patientName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 30px;
            max-width: 1200px;
            margin: 0 auto;
            background: #fff;
          }
          
          /* Header Styles */
          .header {
            text-align: center;
            padding-bottom: 20px;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            position: relative;
          }
          
          .header h1 {
            color: #1e40af;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
          }
          
          .header .hospital-name {
            color: #2563eb;
            font-size: 18px;
            font-weight: 600;
          }
          
          .header .report-id {
            position: absolute;
            top: 0;
            right: 0;
            background: #f8fafc;
            padding: 8px 15px;
            border-radius: 6px;
            font-size: 14px;
            color: #475569;
            border: 1px solid #e2e8f0;
          }
          
          /* Section Styles */
          .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          
          .section h2 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          /* Grid Layout for Patient Info */
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          
          .info-item {
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          
          .info-item .label {
            font-weight: 600;
            color: #475569;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          
          .info-item .value {
            color: #1e293b;
            font-size: 16px;
            font-weight: 500;
          }
          
          /* Badge Styles */
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .badge-emergency {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }
          
          .badge-urgent {
            background: #ffedd5;
            color: #ea580c;
            border: 1px solid #fed7aa;
          }
          
          .badge-routine {
            background: #dcfce7;
            color: #16a34a;
            border: 1px solid #bbf7d0;
          }
          
          /* Images Section */
          .images-section {
            page-break-inside: avoid;
          }
          
          .image-container {
            margin-bottom: 25px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .image-container img {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 6px;
            display: block;
            margin: 10px auto;
            max-height: 500px;
            object-fit: contain;
          }
          
          .image-info {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #e2e8f0;
          }
          
          .image-info h4 {
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          /* Table Styles */
          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .summary-table th {
            background: #f1f5f9;
            color: #475569;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
            padding: 12px 15px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .summary-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }
          
          .summary-table tr:last-child td {
            border-bottom: none;
          }
          
          /* Footer */
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 13px;
          }
          
          .footer .disclaimer {
            font-style: italic;
            margin-bottom: 10px;
            color: #94a3b8;
          }
          
          .signature-section {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 1px dashed #e2e8f0;
          }
          
          .signature-box {
            text-align: center;
            min-width: 200px;
          }
          
          .signature-line {
            margin-top: 60px;
            border-top: 1px solid #000;
            width: 200px;
            display: inline-block;
          }
          
          /* Print-specific styles */
          @media print {
            body {
              padding: 20px;
            }
            
            .section {
              page-break-inside: avoid;
            }
            
            .image-container {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            img {
              max-height: 400px !important;
            }
            
            .no-print {
              display: none;
            }
            
            .header {
              border-color: #000;
            }
          }
          
          /* Loading state for images */
          img:not(.loaded) {
            opacity: 0;
            height: 0;
          }
          
          .image-loading {
            text-align: center;
            padding: 20px;
            color: #64748b;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="report-id">
            Report ID: ${record.patientUniqueId}
          </div>
          <h1>X-RAY DIAGNOSTIC REPORT</h1>
          <p class="hospital-name">HOSPITAL MANAGEMENT SYSTEM</p>
          <p style="color: #64748b; margin-top: 5px;">Medical Imaging Department</p>
        </div>
        
        <!-- Patient Information -->
        <div class="section">
          <h2>📋 PATIENT INFORMATION</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Full Name</div>
              <div class="value">${record.patientName}</div>
            </div>
            <div class="info-item">
              <div class="label">Patient ID</div>
              <div class="value">${record.patientUniqueId}</div>
            </div>
            <div class="info-item">
              <div class="label">Age & Gender</div>
              <div class="value">${record.age} years, ${record.gender}</div>
            </div>
            ${record.phone ? `
            <div class="info-item">
              <div class="label">Contact Number</div>
              <div class="value">${record.phone}</div>
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Test Information -->
        <div class="section">
          <h2>🔬 TEST DETAILS</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Test Name</div>
              <div class="value">${record.testName}</div>
            </div>
            <div class="info-item">
              <div class="label">Category</div>
              <div class="value" style="text-transform: capitalize;">${record.category}</div>
            </div>
            <div class="info-item">
              <div class="label">Priority</div>
              <div class="value">
                <span class="badge badge-${record.priority}">
                  ${record.priority}
                </span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">Performed Date</div>
              <div class="value">${formatDate(record.performedDate)}</div>
            </div>
          </div>
          
          ${record.instructions ? `
          <div style="margin-top: 15px;">
            <div class="label" style="margin-bottom: 5px;">Special Instructions</div>
            <div class="value">${record.instructions}</div>
          </div>
          ` : ''}
          
          ${record.overallNotes ? `
          <div style="margin-top: 15px;">
            <div class="label" style="margin-bottom: 5px;">Notes & Charges</div>
            <div class="value">${record.overallNotes}</div>
          </div>
          ` : ''}
        </div>
        
        <!-- X-ray Images Section -->
        <div class="section images-section">
          <h2>📷 X-RAY IMAGES (${record.images.length})</h2>
          <p style="color: #64748b; margin-bottom: 20px;">
            Below are the digital X-ray images captured during the procedure.
          </p>
          
          ${record.images.length > 0 ? imagesHTML : `
          <div style="text-align: center; padding: 30px; background: #f8fafc; border-radius: 6px;">
            <p style="color: #64748b; font-style: italic;">No images available for this record.</p>
          </div>
          `}
          
          <!-- Images Summary Table -->
          <table class="summary-table">
            <thead>
              <tr>
                <th>Image #</th>
                <th>Filename</th>
                <th>Note</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${record.images.map((img, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${img.filename}</td>
                  <td>${img.note || 'No note provided'}</td>
                  <td>
                    <span style="color: #16a34a; font-weight: 500;">✓ Available</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Technician & Metadata -->
        <div class="section">
          <h2>👨‍⚕️ TECHNICIAN INFORMATION</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Performed By</div>
              <div class="value">${record.performedBy}</div>
            </div>
            <div class="info-item">
              <div class="label">Report Status</div>
              <div class="value">
                <span style="color: #16a34a; font-weight: 500;">${record.status}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">Report Generated</div>
              <div class="value">${formatDate(record.createdAt)}</div>
            </div>
            <div class="info-item">
              <div class="label">Report Printed</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p class="disclaimer">
            This is a computer-generated report. For digital verification, reference ID: ${record._id}
          </p>
          
          <div class="signature-section">
            <div class="signature-box">
              <p>________________________</p>
              <p>X-ray Technician</p>
              <p>${record.performedBy}</p>
            </div>
            
            <div class="signature-box">
              <p>________________________</p>
              <p>Hospital Stamp & Seal</p>
              <p>Medical Imaging Department</p>
            </div>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
            Report ID: ${record._id} | Generated by Hospital Management System v1.0
          </p>
          <p style="font-size: 11px; color: #cbd5e1;">
            This document contains confidential medical information. Unauthorized distribution is prohibited.
          </p>
        </div>
        
        <script>
          // Wait for all images to load before printing
          window.onload = function() {
            const images = document.querySelectorAll('img');
            let loadedCount = 0;
            const totalImages = images.length;
            
            if (totalImages === 0) {
              window.print();
              setTimeout(() => window.close(), 1500);
              return;
            }
            
            images.forEach(img => {
              if (img.complete) {
                img.classList.add('loaded');
                loadedCount++;
              } else {
                img.onload = function() {
                  this.classList.add('loaded');
                  loadedCount++;
                  checkAllLoaded();
                };
                img.onerror = function() {
                  loadedCount++;
                  this.parentElement.innerHTML += '<p style="color: #dc2626; font-style: italic;">Image failed to load</p>';
                  checkAllLoaded();
                };
              }
            });
            
            function checkAllLoaded() {
              if (loadedCount === totalImages) {
                // Small delay to ensure images are rendered
                setTimeout(() => {
                  window.print();
                  setTimeout(() => {
                    window.close();
                  }, 1500);
                }, 500);
              }
            }
            
            // Fallback timeout
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1500);
            }, 5000);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" />
                Walk-in X-ray Records Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage all walk-in X-ray patient records, view reports, and handle operations
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Records</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.totalWalkInXrays}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today's Records</p>
                  <p className="text-3xl font-bold text-gray-900">{statistics.todayWalkInXrays}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Categories</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statistics.categories?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              Search & Filter Records
            </h2>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, ID, Phone, Test..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="chest">Chest</option>
                <option value="abdomen">Abdomen</option>
                <option value="spine">Spine</option>
                <option value="skull">Skull</option>
                <option value="extremities">Extremities</option>
                <option value="dental">Dental</option>
                <option value="mammography">Mammography</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Walk-in X-ray Records ({pagination.totalRecords})
            </h3>
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No walk-in X-ray records found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      {/* Patient Details */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900">{record.patientName}</p>
                            <button
                              onClick={() => copyToClipboard(record.patientUniqueId)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                              {record.patientUniqueId}
                            </span>
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Age:</span> {record.age} years
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Gender:</span> {record.gender}
                            </p>
                            {record.phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {record.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Test Information */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">{record.testName}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(record.category)}`}>
                              {record.category}
                            </span>
                            {getPriorityBadge(record.priority)}
                          </div>
                          <div className="space-y-1">
                            {record.overallNotes && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Charges:</span> {record.overallNotes}
                              </p>
                            )}
                            {record.instructions && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Instructions:</span> {record.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Images */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Image className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {record.images?.length || 0} Images
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {record.images?.slice(0, 3).map((image, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedRecord(record);
                                  handleViewImage(image, idx);
                                }}
                                className="relative group"
                              >
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                  <img
                                    src={image.image}
                                    alt={`X-ray ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                  <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </button>
                            ))}
                            {record.images?.length > 3 && (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                                <span className="text-sm text-gray-600">
                                  +{record.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date & Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Performed Date</p>
                            <p className="text-sm text-gray-600">{formatDate(record.performedDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Technician</p>
                            <p className="text-sm text-gray-600">{record.performedBy}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Created</p>
                            <p className="text-sm text-gray-600">{formatDate(record.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">{record.status}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => printRecord(record)}
                            className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Printer className="w-4 h-4" />
                            Print Report
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {records.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
                  {pagination.totalRecords} records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination({...pagination, currentPage: pageNum})}
                          className={`px-3 py-2 rounded-lg ${
                            pagination.currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recordToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Record</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the record for{' '}
              <span className="font-semibold">{recordToDelete.patientName}</span>?
              <br />
              <span className="text-sm text-gray-500">
                This will also delete all associated X-ray images.
              </span>
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {showImageModal && selectedImage && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  X-ray Image {imageIndex + 1} of {selectedRecord.images.length}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedRecord.patientName} - {selectedImage.filename}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedImage.note && (
                  <div className="bg-blue-50 px-3 py-1 rounded-lg">
                    <p className="text-sm text-blue-700 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {selectedImage.note}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="relative p-4 flex items-center justify-center min-h-[60vh]">
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="max-w-full max-h-[60vh] overflow-auto">
                <img
                  src={selectedImage.image}
                  alt={`X-ray ${imageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Cloudinary ID: <span className="font-mono text-xs">{selectedImage.cloudinary_id}</span></p>
                  <p>Size: {(selectedImage.size || 0).toLocaleString()} bytes</p>
                </div>
                <button
                  onClick={() => window.open(selectedImage.image, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Record Details</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Patient Information Card */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedRecord.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Walk-in ID</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 font-mono">{selectedRecord.patientUniqueId}</p>
                      <button
                        onClick={() => copyToClipboard(selectedRecord.patientUniqueId)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age & Gender</p>
                    <p className="font-medium text-gray-900">
                      {selectedRecord.age} years, {selectedRecord.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">
                      {selectedRecord.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Information Card */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Test Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Test Name</p>
                    <p className="font-medium text-gray-900">{selectedRecord.testName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${getCategoryColor(selectedRecord.category)}`}>
                      {selectedRecord.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    {getPriorityBadge(selectedRecord.priority)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Performed Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedRecord.performedDate)}</p>
                  </div>
                  {selectedRecord.instructions && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Instructions</p>
                      <p className="font-medium text-gray-900">{selectedRecord.instructions}</p>
                    </div>
                  )}
                  {selectedRecord.overallNotes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Charges Details</p>
                      <p className="font-medium text-gray-900">{selectedRecord.overallNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Images Gallery */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  X-ray Images ({selectedRecord.images?.length || 0})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedRecord.images?.map((image, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden bg-white">
                      <div 
                        className="h-48 cursor-pointer"
                        onClick={() => {
                          setSelectedImage(image);
                          setImageIndex(idx);
                          setShowImageModal(true);
                        }}
                      >
                        <img
                          src={image.image}
                          alt={`X-ray ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{image.filename}</p>
                        {image.note && (
                          <p className="text-xs text-gray-600 mt-1">{image.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technician & Metadata */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  Technician & Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Performed By</p>
                    <p className="font-medium text-gray-900">{selectedRecord.performedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-600">{selectedRecord.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Record Created</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => printRecord(selectedRecord)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Full Report
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalkInXrayRecords;