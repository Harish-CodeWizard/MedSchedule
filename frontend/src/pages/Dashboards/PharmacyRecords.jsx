import React, { useState, useEffect } from 'react';
import patientStore from '../../store/patientStore';
import {
  Printer, FileText, Filter, Download,
  Eye, RefreshCw, BarChart3, DollarSign,
  User, CheckCircle, Search
} from 'lucide-react';

function PharmacyRecords() {
  const {
    getCompletePrescriptions,
    CompletePresception
  } = patientStore();

  const [loading, setLoading] = useState(false);
  const [completedPrescriptions, setCompletedPrescriptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
console.log(filteredData)
  const [stats, setStats] = useState({
    totalToday: 0,
    totalAllTime: 0,
    revenueToday: 0,
    revenueAllTime: 0,
    patientsToday: 0,
    patientsAllTime: 0
  });

  /* ================= FETCH ================= */
  const fetchCompletePrescriptions = async () => {
    setLoading(true);
    try {
      await getCompletePrescriptions();
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletePrescriptions();
  }, []);

  /* ================= PROCESS DATA ================= */
  useEffect(() => {
    if (!Array.isArray(CompletePresception)) return;

    const today = new Date().toISOString().split('T')[0];

    let totalToday = 0;
    let revenueToday = 0;
    let revenueAllTime = 0;

    const patientsTodaySet = new Set();
    const patientsAllTimeSet = new Set();

    const formatted = CompletePresception.map(item => {
      const pres = item.prescription || {};
      const doctor = item.doctorAppointment || {};

      const charges = Number(pres.charges) || Number(doctor.charges) || 0;
      const completedDate = pres.updatedAt || pres.prescribedDate;

      revenueAllTime += charges;
      patientsAllTimeSet.add(item.patientId);

      if (completedDate?.startsWith(today)) {
        totalToday++;
        revenueToday += charges;
        patientsTodaySet.add(item.patientId);
      }

      return {
        _id: pres._id,
        patientId: item.patientId,
        patientName: item.patientName,
        patientUniqueId: item.uniqueID,
        patientAge: item.patientAge || 'N/A',
        patientGender: item.patientGender || 'N/A',
        patientPhone: item.patientPhone || 'N/A',

        doctorName: doctor.doctorName || pres.doctorName,
        specialist: doctor.specialist || pres.specialist || 'General',
        diagnosis: pres.diagnosis || 'No diagnosis',

        charges,
        completedDate,
        PharmacyPerson: pres.PharmacyPerson || 'Unknown',

        medicines: pres.medicines || [],
        status: pres.status || 'Completed'
      };
    });

    setCompletedPrescriptions(formatted);
    setStats({
      totalToday,
      totalAllTime: formatted.length,
      revenueToday,
      revenueAllTime,
      patientsToday: patientsTodaySet.size,
      patientsAllTime: patientsAllTimeSet.size
    });

  }, [CompletePresception]);

  /* ================= FILTER ================= */
  useEffect(() => {
    let data = [...completedPrescriptions];

    if (selectedDate) {
      data = data.filter(p =>
        p.completedDate?.startsWith(selectedDate)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p =>
        p.patientName.toLowerCase().includes(q) ||
        p.patientUniqueId.toLowerCase().includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(q))
      );
    }

    setFilteredData(data);
  }, [completedPrescriptions, selectedDate, searchQuery]);


  const handleViewDetails = (prescription) => {

    alert(`💊 Walk-in Pharmacy Record\n
📋 Record Information:
Record ID: ${prescription?.patientUniqueId}

👤 Customer Information:
Name: ${prescription.patientName}
Doctor: ${prescription.doctorName}
Diagnosis: ${prescription.diagnosis}

💰 Financial Information:
Charges: PKR ${prescription.charges}

💊 Medicines: ${prescription.medicines.length} items`);
  };


    
    
 const handlePrintReceipt = (prescription) => {
  try {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pharmacy Prescription Receipt - ${prescription.patientUniqueId}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px; 
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            padding: 20px;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
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
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border: 1px solid #e2e8f0;
          }
          .medicine-item {
            padding: 8px 0;
            border-bottom: 1px dashed #e2e8f0;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            text-align: right;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #e2e8f0;
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
            .header { background: #059669 !important; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h2>PHARMACY PRESCRIPTION RECEIPT</h2>
            <div>Receipt #${prescription.patientUniqueId}</div>
          </div>
          
          <div class="info-section">
            <h3 style="color: #059669; margin-top: 0;">Patient Information</h3>
            <p><strong>Name:</strong> ${prescription.patientName}</p>
            <p><strong>Patient ID:</strong> ${prescription.patientUniqueId}</p>
          </div>
          
          <div class="info-section">
            <h3 style="color: #059669; margin-top: 0;">Medical Information</h3>
            <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
            <p><strong>Specialist:</strong> ${prescription.specialist}</p>
            <p><strong>Diagnosis:</strong> ${prescription.diagnosis || 'N/A'}</p>
          </div>
          
          <div class="info-section">
            <h3 style="color: #059669; margin-top: 0;">Pharmacy Information</h3>
            <p><strong>Dispensed By:</strong> ${prescription.PharmacyPerson || 'Unknown'}</p>
            <p><strong>Completed Date:</strong> ${prescription.completedDate ? new Date(prescription.completedDate).toLocaleString() : 'N/A'}</p>
          </div>
          
          <div class="info-section">
            <h3 style="color: #059669; margin-top: 0;">Medicines Dispensed</h3>
            ${(prescription.medicines || []).map(med => {
              const quantity = Number(med.quantity) || 0;
              
              return `
                <div class="medicine-item">
                  <div><strong>${med.medicineName || 'N/A'}</strong></div>
                  <small>Quantity: ${quantity} | Dosage: ${med.dosage || 'N/A'} | Frequency: ${med.frequency || 'N/A'}</small><br>
                  <small>Duration: ${med.duration || 0} days | Timing: ${med.timing || 'N/A'}</small><br>
                  <small>Total: PKR ${prescription.charges ? prescription.charges.toLocaleString() : '0'}</small>
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="total">
            Total Amount: PKR ${prescription.charges ? prescription.charges.toLocaleString() : '0'}
          </div>
          
          <div class="footer">
            <p>Hospital Management System - Pharmacy Department</p>
            <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 40px;">
          <button onclick="window.print()" style="
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer;
            margin-right: 10px;
          ">
            Print Receipt
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
        
        <script>
          setTimeout(() => {
            window.focus();
          }, 500);
        </script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to print receipt');
      return;
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.focus();
    };
    
  } catch (error) {
    console.error('Error printing receipt:', error);
    alert('Error printing receipt');
  }
};
const handleExportData = () => {
  if (filteredData.length === 0) {
    alert('No data available to print');
    return;
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pharmacy Records Report - ${today}</title>
      <style>
        @page {
          size: A4;
          margin: 0.5in;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          background: #fff;
          line-height: 1.4;
        }
        
        .print-container {
          max-width: 100%;
        }
        
        /* Header Styles */
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #059669;
        }
        
        .header h1 {
          color: #059669;
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .header .subtitle {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        /* Report Summary */
        .summary-section {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }
        
        /* Filters Info */
        .filters-info {
          background: #fef3c7;
          padding: 12px 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #92400e;
          border: 1px solid #fbbf24;
        }
        
        /* Table Styles */
        .records-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        
        .records-table thead {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
        }
        
        .records-table th {
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 11px;
          border: 1px solid #059669;
        }
        
        .records-table td {
          padding: 8px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        
        .records-table tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        .records-table tbody tr:hover {
          background-color: #f0f9ff;
        }
        
        .patient-info {
          font-weight: 600;
          color: #1e293b;
        }
        
        .patient-id {
          font-size: 11px;
          color: #64748b;
          font-family: monospace;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 3px;
          display: inline-block;
        }
        
        .amount-cell {
          font-weight: 700;
          color: #059669;
          text-align: right;
        }
        
        .doctor-cell {
          color: #475569;
          font-size: 11px;
        }
        
        /* Medicines List in Table */
        .medicines-list {
          margin: 0;
          padding-left: 15px;
          font-size: 11px;
          color: #475569;
        }
        
        .medicine-item {
          margin-bottom: 2px;
        }
        
        /* Total Section */
        .total-section {
          margin-top: 30px;
          padding: 15px;
          background: #f0f9ff;
          border-radius: 8px;
          border: 1px solid #bae6fd;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
        }
        
        .total-label {
          font-weight: 600;
          color: #334155;
        }
        
        .total-value {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }
        
        /* Footer */
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        /* Print Specific Styles */
        @media print {
          body {
            padding: 15px;
            font-size: 12px;
          }
          
          .header {
            border-bottom: 2px solid #000;
          }
          
          .no-print {
            display: none;
          }
          
          .records-table thead {
            background: #000 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
          
          .records-table th {
            border: 1px solid #000;
          }
          
          .summary-section {
            border: 1px solid #ccc;
          }
          
          .total-section {
            border: 1px solid #999;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <!-- Header -->
        <div class="header">
          <h1>Pharmacy Records Report</h1>
          <div class="subtitle">Hospital Management System - Pharmacy Department</div>
          <div class="subtitle">Generated on: ${today}</div>
        </div>
        
        <!-- Report Summary -->
        <div class="summary-section">
          <div class="summary-item">
            <div class="summary-label">Total Records</div>
            <div class="summary-value">${filteredData.length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Revenue</div>
            <div class="summary-value">PKR ${filteredData.reduce((sum, item) => sum + (item.charges || 0), 0).toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Date Range</div>
            <div class="summary-value">${selectedDate || 'All Dates'}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Search Filter</div>
            <div class="summary-value">${searchQuery || 'None'}</div>
          </div>
        </div>
        
        <!-- Filters Information -->
        ${(selectedDate || searchQuery) ? `
          <div class="filters-info">
            <strong>Applied Filters:</strong>
            ${selectedDate ? `<br>• Date: ${selectedDate}` : ''}
            ${searchQuery ? `<br>• Search: "${searchQuery}"` : ''}
          </div>
        ` : ''}
        
        <!-- Records Table -->
        <table class="records-table">
          <thead>
            <tr>
              <th style="width: 25%">Patient Information</th>
              <th style="width: 20%">Doctor & Diagnosis</th>
              <th style="width: 20%">Medicines</th>
              <th style="width: 10%">Amount (PKR)</th>
              <th style="width: 15%">Date & Time</th>
              <th style="width: 10%">Dispensed By</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((record, index) => {
              const date = record.completedDate ? new Date(record.completedDate) : new Date();
              const formattedDate = date.toLocaleDateString('en-GB');
              const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return `
                <tr>
                  <td>
                    <div class="patient-info">${record.patientName}</div>
                    <div class="patient-id">ID: ${record.patientUniqueId || 'N/A'}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
                      ${record.patientPhone && record.patientPhone !== 'N/A' ? `Phone: ${record.patientPhone}` : ''}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #1e293b;">Dr. ${record.doctorName}</div>
                    <div class="doctor-cell">${record.specialist || 'General'}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                      ${record.diagnosis && record.diagnosis !== 'No diagnosis' ? `Dx: ${record.diagnosis}` : ''}
                    </div>
                  </td>
                  <td>
                    ${record.medicines && record.medicines.length > 0 ? `
                      <ul class="medicines-list">
                        ${record.medicines.slice(0, 3).map(med => `
                          <li class="medicine-item">
                            <strong>${med.medicineName}</strong> (${med.quantity})
                          </li>
                        `).join('')}
                        ${record.medicines.length > 3 ? `
                          <li class="medicine-item" style="color: #94a3b8; font-style: italic;">
                            + ${record.medicines.length - 3} more medicines
                          </li>
                        ` : ''}
                      </ul>
                    ` : '<span style="color: #94a3b8;">No medicines listed</span>'}
                  </td>
                  <td class="amount-cell">
                    PKR ${record.charges ? record.charges.toLocaleString() : '0'}
                  </td>
                  <td>
                    <div>${formattedDate}</div>
                    <div style="font-size: 11px; color: #64748b;">${formattedTime}</div>
                  </td>
                  <td>
                    <div style="font-size: 11px; color: #475569;">
                      ${record.PharmacyPerson || 'Unknown'}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <!-- Total Summary -->
        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Total Records:</span>
            <span style="font-weight: 700;">${filteredData.length}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Total Revenue:</span>
            <span class="total-value">
              PKR ${filteredData.reduce((sum, item) => sum + (item.charges || 0), 0).toLocaleString()}
            </span>
          </div>
          ${selectedDate ? `
            <div class="total-row">
              <span class="total-label">Selected Date:</span>
              <span>${selectedDate}</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>This report contains ${filteredData.length} pharmacy records</p>
          <p>Report generated by: Hospital Management System</p>
          <p>Page 1 of 1 | Generated at: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
      
      <!-- Print Controls (Visible only on screen) -->
      <div class="no-print" style="text-align: center; margin-top: 40px; padding: 20px; border-top: 2px solid #e2e8f0;">
        <button onclick="window.print()" style="
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          margin-right: 10px;
        ">
          🖨️ Print Report
        </button>
        <button onclick="window.close()" style="
          background: #dc2626;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        ">
          ❌ Close Window
        </button>
      </div>
      
      <script>
        // Auto focus and print after loading
        window.onload = function() {
          window.focus();
          
          // Auto-print if needed (uncomment the line below)
          // setTimeout(() => { window.print(); }, 1000);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
  
  if (!printWindow) {
    alert('Please allow popups to generate report');
    return;
  }
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  printWindow.onload = function() {
    printWindow.focus();
  };
};

// // Usage in your component
// const handleExportData = () => {
//   // You can keep both options - CSV export and Print Report
//   const option = window.confirm('Select export option:\n\nOK - Print formatted report\nCancel - Download CSV file');
  
//   if (option) {
//     handlePrintReport();
//   } else {
//     // Original CSV export code
//     const csv = [
//       ['Patient Name', 'Patient ID', 'Doctor', 'Specialist', 'Diagnosis', 'Charges', 'Date', 'Pharmacy Person', 'Medicines Count'],
//       ...filteredData.map(p => [
//         p.patientName,
//         p.patientUniqueId,
//         p.doctorName,
//         p.specialist,
//         p.diagnosis,
//         p.charges,
//         new Date(p.completedDate).toLocaleDateString(),
//         p.PharmacyPerson,
//         p.medicines ? p.medicines.length : 0
//       ])
//     ].map(row => row.join(',')).join('\n');

//     const blob = new Blob([csv], { type: 'text/csv' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = `pharmacy_records_${new Date().toISOString().split('T')[0]}.csv`;
//     link.click();
//   }
// };
  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-600" />
                Pharmacy Records & History
              </h1>
              <p className="text-gray-600 mt-1">
                View all completed prescriptions and pharmacy transactions
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchCompletePrescriptions}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleExportData}
                disabled={filteredData.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalAllTime}</div>
                  <div className="text-sm text-gray-600">Total Prescriptions</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Today: {stats.totalToday}
              </div>
              
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">PKR {stats.revenueAllTime.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Today: PKR {stats.revenueToday.toLocaleString()}
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
                  Filter Records
                </h3>
                <p className="text-gray-600 text-sm">Search and filter pharmacy records</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Search patient, doctor, ID..."
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Completed Prescriptions 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({filteredData.length} records)
                  </span>
                </h3>
                <div className="text-sm text-gray-600">
                  Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading pharmacy records...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No pharmacy records found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedDate ? `for ${selectedDate}` : searchQuery ? `matching "${searchQuery}"` : ''}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Information
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor & Diagnosis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
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
                    {filteredData.map((prescription, index) => (
                      <tr key={prescription._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {prescription.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {prescription.patientUniqueId}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {prescription.doctorName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {prescription.specialist}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-emerald-700">
                            PKR {prescription.charges.toLocaleString()}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {prescription.completedDate ? new Date(prescription.completedDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(prescription)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(prescription)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary */}
            {filteredData.length > 0 && !loading && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {filteredData.length} of {completedPrescriptions.length} total records
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PharmacyRecords;