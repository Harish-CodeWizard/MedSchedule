import React, { useState, useEffect } from 'react';
import prescriptionStore from '../../store/prescriptionStore'; // Adjust path as needed
import {
  Printer, FileText, Filter, Download,
  Eye, RefreshCw, BarChart3, DollarSign,
  User, CheckCircle, Search, Package
} from 'lucide-react';

function WalkInPharmacyRecords() {
  const {
    medicines: walkInRecords,
    getAllPresception,
    deletePresception,
    loading
  } = prescriptionStore();

  const [allRecords, setAllRecords] = useState([]); //  Original data store karein
  const [filteredData, setFilteredData] = useState([]); // Filtered data ke liye
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
console.log(allRecords)
  const [stats, setStats] = useState({
    totalToday: 0,
    totalAllTime: 0,
    revenueToday: 0,
    revenueAllTime: 0,
    medicinesToday: 0,
    medicinesAllTime: 0
  });

  /* ================= FETCH ================= */
  const fetchWalkInRecords = async () => {
    try {
      await getAllPresception();
    } catch (error) {
      console.error('Error fetching walk-in records:', error);
    }
  };

  useEffect(() => {
    fetchWalkInRecords();
  }, []);

  /* ================= PROCESS ALL RECORDS ================= */
  useEffect(() => {
    if (!Array.isArray(walkInRecords)) return;

    const today = new Date().toISOString().split('T')[0];

    let totalToday = 0;
    let revenueToday = 0;
    let revenueAllTime = 0;
    let medicinesToday = 0;
    let medicinesAllTime = 0;

    const formatted = walkInRecords.map(record => {
      const charges = Number(record.charges) || 0;
      const medicineCount = record.medicines?.length || 0;
      const createdAt = record.createdAt;
      const isToday = createdAt?.startsWith(today);

      revenueAllTime += charges;
      medicinesAllTime += medicineCount;

      if (isToday) {
        totalToday++;
        revenueToday += charges;
        medicinesToday += medicineCount;
      }

      return {
        _id: record._id,
        recordId: `WALK-${record._id?.substring(0, 8).toUpperCase() || '0000'}`,
        patientName: record.patientName || 'Walk-in Customer',
        patientPhone: record.patientPhone || 'N/A',
        PharmacyPerson: record.PharmacyPerson || 'Unknown Staff',
        charges: charges,
        totalMedicines: medicineCount,
        createdAt: createdAt,
        updatedAt: record.updatedAt,
        medicines: record.medicines || []
      };
    });

    setAllRecords(formatted); // ✅ Original data store karo
    setStats({
      totalToday,
      totalAllTime: formatted.length,
      revenueToday,
      revenueAllTime,
      medicinesToday,
      medicinesAllTime
    });
  }, [walkInRecords]);

  /* ================= APPLY FILTERS ================= */
  useEffect(() => {
    if (allRecords.length === 0) {
      setFilteredData([]);
      return;
    }

    let data = [...allRecords]; // ✅ Always start from original data

    // Date filter
    if (selectedDate) {
      data = data.filter(record =>
        record.createdAt?.startsWith(selectedDate)
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(record =>
        record.patientName.toLowerCase().includes(q) ||
        record.recordId.toLowerCase().includes(q) ||
        record.PharmacyPerson.toLowerCase().includes(q) ||
        record.patientPhone.toLowerCase().includes(q)
      );
    }

    setFilteredData(data); // ✅ Only set filtered results
  }, [allRecords, selectedDate, searchQuery]); // ✅ allRecords ko dependency mein add karo

  /* ================= ACTIONS ================= */
  const handleViewDetails = (record) => {
    const medicinesList = record.medicines.map(med => 
      `${med.medicineName} - Qty: ${med.quantity} - Charges: PKR ${med.pharmacyCharges || 0}`
    ).join('\n');

    alert(`💊 Walk-in Pharmacy Record\n
📋 Record Information:
Record ID: ${record.recordId}
Date: ${new Date(record.createdAt).toLocaleString()}

👤 Customer Information:
Name: ${record.patientName}
Phone: ${record.patientPhone}

👨‍⚕️ Pharmacy Information:
Handled By: ${record.PharmacyPerson}

💰 Financial Information:
Total Charges: PKR ${record.charges.toLocaleString()}

💊 Medicines Dispensed (${record.totalMedicines}):
${medicinesList || 'No medicines listed'}`);
  };

  const handlePrintReceipt = (record) => {
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Walk-in Pharmacy Receipt - ${record.recordId}</title>
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
              background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
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
              color: #3b82f6;
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
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h2>WALK-IN PHARMACY RECEIPT</h2>
              <div>Receipt #${record.recordId}</div>
            </div>
            
            <div class="info-section">
              <h3 style="color: #3b82f6; margin-top: 0;">Customer Information</h3>
              <p><strong>Name:</strong> ${record.patientName}</p>
              <p><strong>Phone:</strong> ${record.patientPhone}</p>
              <p><strong>Date & Time:</strong> ${new Date(record.createdAt).toLocaleString()}</p>
            </div>
            
            <div class="info-section">
              <h3 style="color: #3b82f6; margin-top: 0;">Pharmacy Information</h3>
              <p><strong>Handled By:</strong> ${record.PharmacyPerson}</p>
            </div>
            
            <div class="info-section">
              <h3 style="color: #3b82f6; margin-top: 0;">Medicines Dispensed</h3>
              ${(record.medicines || []).map(med => `
                <div class="medicine-item">
                  <div><strong>${med.medicineName || 'N/A'}</strong></div>
                  <small>Quantity: ${med.quantity || 0} | Unit Charges: PKR ${med.pharmacyCharges || 0}</small><br>
                  <small>Total: PKR ${(Number(med.quantity) * Number(med.pharmacyCharges)).toLocaleString()}</small>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              Total Amount: PKR ${record.charges.toLocaleString()}
            </div>
            
            <div class="footer">
              <p>Hospital Management System - Walk-in Pharmacy</p>
              <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 40px;">
            <button onclick="window.print()" style="
              background: #3b82f6;
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

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this walk-in record?')) {
      const success = await deletePresception(id);
      if (success) {
        fetchWalkInRecords();
      }
    }
  };


const handleExportData = () => {
  if (allRecords.length === 0) {
    alert('No walk-in pharmacy records available to export');
    return;
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  // Calculate summary statistics
  const totalRevenue = allRecords.reduce((sum, record) => sum + (record.charges || 0), 0);
  const totalMedicines = allRecords.reduce((sum, record) => sum + (record.totalMedicines || 0), 0);
  const uniqueCustomers = new Set(allRecords.map(record => record.patientName)).size;
  
  // Group by date for daily breakdown
  const recordsByDate = {};
  allRecords.forEach(record => {
    const date = record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-GB') : 'Unknown Date';
    if (!recordsByDate[date]) {
      recordsByDate[date] = {
        count: 0,
        revenue: 0,
        medicines: 0
      };
    }
    recordsByDate[date].count++;
    recordsByDate[date].revenue += record.charges || 0;
    recordsByDate[date].medicines += record.totalMedicines || 0;
  });

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Walk-in Pharmacy Records Report - ${today}</title>
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
        
        .report-container {
          max-width: 100%;
        }
        
        /* Header Styles */
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        
        .header h1 {
          color: #3b82f6;
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .header .subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 5px 0;
        }
        
        /* Summary Section */
        .summary-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 25px;
          border: 1px solid #cbd5e1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        @media (min-width: 768px) {
          .summary-section {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .summary-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        
        .summary-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: #1e40af;
        }
        
        .summary-value.revenue {
          color: #059669;
        }
        
        /* Report Information */
        .report-info {
          background: #dbeafe;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }
        
        /* Daily Breakdown */
        .daily-section {
          margin-bottom: 25px;
        }
        
        .section-title {
          color: #3b82f6;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #dbeafe;
        }
        
        .daily-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 12px;
        }
        
        .daily-table thead {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          color: white;
        }
        
        .daily-table th {
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 11px;
          border: 1px solid #3b82f6;
        }
        
        .daily-table td {
          padding: 8px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        
        .daily-table tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        /* Records Table */
        .records-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 11px;
        }
        
        .records-table thead {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          color: white;
        }
        
        .records-table th {
          padding: 10px 6px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 10px;
          border: 1px solid #3b82f6;
        }
        
        .records-table td {
          padding: 8px 6px;
          border: 1px solid #e2e8f0;
          vertical-align: top;
        }
        
        .records-table tbody tr:hover {
          background-color: #f0f9ff;
        }
        
        .record-id {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #1e40af;
          font-size: 10px;
        }
        
        .customer-name {
          font-weight: 600;
          color: #1e293b;
        }
        
        .amount-cell {
          font-weight: 700;
          color: #059669;
          text-align: right;
        }
        
        .date-cell {
          color: #475569;
          font-size: 10px;
        }
        
        /* Medicines List in Records */
        .medicines-mini {
          margin: 0;
          padding-left: 12px;
          font-size: 9px;
          color: #475569;
        }
        
        .medicine-mini-item {
          margin-bottom: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        
        /* Total Summary */
        .total-section {
          margin-top: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 10px;
          border: 2px solid #93c5fd;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        
        .total-label {
          font-weight: 600;
          color: #334155;
          font-size: 14px;
        }
        
        .total-value {
          font-size: 18px;
          font-weight: 700;
          color: #1e40af;
        }
        
        .total-value.revenue {
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
            border-bottom: 3px solid #000;
          }
          
          .no-print {
            display: none;
          }
          
          .records-table thead,
          .daily-table thead {
            background: #3b82f6 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
          
          .summary-item {
            border: 1px solid #ccc;
          }
          
          .total-section {
            border: 2px solid #999;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <!-- Header -->
        <div class="header">
          <h1>WALK-IN PHARMACY RECORDS REPORT</h1>
          <div class="subtitle">Hospital Management System - Pharmacy Department</div>
          <div class="subtitle">Report Period: Complete History</div>
          <div class="subtitle">Generated on: ${today} at ${currentTime}</div>
        </div>
        
        <!-- Report Information -->
        <div class="report-info">
          <strong>Report Summary:</strong> This report contains ${allRecords.length} walk-in pharmacy transactions from ${Object.keys(recordsByDate).length} different days.
        </div>
        
        <!-- Summary Statistics -->
        <div class="summary-section">
          <div class="summary-item">
            <div class="summary-label">Total Records</div>
            <div class="summary-value">${allRecords.length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Revenue</div>
            <div class="summary-value revenue">PKR ${totalRevenue.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Medicines</div>
            <div class="summary-value">${totalMedicines}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Unique Customers</div>
            <div class="summary-value">${uniqueCustomers}</div>
          </div>
        </div>
        
        <!-- Daily Breakdown -->
        <div class="daily-section">
          <div class="section-title">DAILY BREAKDOWN</div>
          <table class="daily-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Records</th>
                <th>Revenue (PKR)</th>
                <th>Medicines</th>
                <th>Avg. per Record</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(recordsByDate).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)).map(([date, data]) => `
                <tr>
                  <td>${date}</td>
                  <td>${data.count}</td>
                  <td>PKR ${data.revenue.toLocaleString()}</td>
                  <td>${data.medicines}</td>
                  <td>PKR ${Math.round(data.revenue / data.count).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- All Records Table -->
        <div class="daily-section">
          <div class="section-title">ALL WALK-IN PHARMACY RECORDS (${allRecords.length})</div>
          <table class="records-table">
            <thead>
              <tr>
                <th style="width: 15%">Record ID</th>
                <th style="width: 20%">Customer</th>
                <th style="width: 25%">Medicines</th>
                <th style="width: 15%">Amount (PKR)</th>
                <th style="width: 15%">Date</th>
                <th style="width: 10%">Staff</th>
              </tr>
            </thead>
            <tbody>
              ${allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((record, index) => {
                const date = record.createdAt ? new Date(record.createdAt) : new Date();
                const formattedDate = date.toLocaleDateString('en-GB');
                const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return `
                  <tr>
                    <td>
                      <div class="record-id">${record.recordId || `WALK-${record._id?.substring(0, 8).toUpperCase() || 'REC'}`}</div>
                    </td>
                    <td>
                      <div class="customer-name">${record.patientName}</div>
                      <div style="font-size: 9px; color: #64748b;">
                        ${record.patientPhone && record.patientPhone !== 'N/A' ? record.patientPhone : 'No Phone'}
                      </div>
                    </td>
                    <td>
                      ${record.medicines && record.medicines.length > 0 ? `
                        <ul class="medicines-mini">
                          ${record.medicines.slice(0, 2).map(med => `
                            <li class="medicine-mini-item" title="${med.medicineName} - Qty: ${med.quantity}">
                              ${med.medicineName} (${med.quantity} × PKR ${med.pharmacyCharges || 0})
                            </li>
                          `).join('')}
                          ${record.medicines.length > 2 ? `
                            <li class="medicine-mini-item" style="color: #94a3b8; font-style: italic;">
                              + ${record.medicines.length - 2} more
                            </li>
                          ` : ''}
                        </ul>
                      ` : '<span style="color: #94a3b8; font-size: 9px;">No details</span>'}
                    </td>
                    <td class="amount-cell">
                      PKR ${record.charges ? record.charges.toLocaleString() : '0'}
                    </td>
                    <td class="date-cell">
                      <div>${formattedDate}</div>
                      <div>${formattedTime}</div>
                    </td>
                    <td>
                      <div style="font-size: 10px; color: #475569;">
                        ${record.PharmacyPerson || 'Unknown'}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Total Summary -->
        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Total Records:</span>
            <span class="total-value">${allRecords.length}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Total Revenue:</span>
            <span class="total-value revenue">PKR ${totalRevenue.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Report Period:</span>
            <span>From ${Object.keys(recordsByDate).sort()[0] || 'N/A'} to ${Object.keys(recordsByDate).sort().reverse()[0] || 'N/A'}</span>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>This report contains ${allRecords.length} walk-in pharmacy records with total revenue of PKR ${totalRevenue.toLocaleString()}</p>
          <p>Hospital Management System - Walk-in Pharmacy Department</p>
          <p>Page 1 of 1 | Generated at: ${currentTime}</p>
          <p>© ${new Date().getFullYear()} - Confidential Report</p>
        </div>
      </div>
      
      <!-- Print Controls -->
      <div class="no-print" style="text-align: center; margin-top: 40px; padding: 20px; border-top: 2px solid #e2e8f0;">
        <button onclick="window.print()" style="
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
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
        // Auto focus and optionally auto-print
        window.onload = function() {
          window.focus();
          
          // Optional: Auto-print after 1 second (uncomment if needed)
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

 
  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                Walk-in Pharmacy Records
              </h1>
              <p className="text-gray-600 mt-1">
                View all walk-in customer pharmacy transactions
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchWalkInRecords}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={()=>{handleExportData(allRecords)}}
                disabled={filteredData.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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
                  <div className="text-sm text-gray-600">Total Records</div>
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
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.medicinesAllTime}</div>
                  <div className="text-sm text-gray-600">Total Medicines</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                Today: {stats.medicinesToday}
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
                <p className="text-gray-600 text-sm">Search and filter walk-in pharmacy records</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search customer, phone, ID..."
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
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Today
                  </button>
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
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Walk-in Pharmacy Records 
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading walk-in pharmacy records...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No walk-in pharmacy records found</p>
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
                        Record Information
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medicines & Charges
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((record, index) => (
                      <tr key={record._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.recordId}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {record._id?.substring(0, 8)}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              📞 {record.patientPhone}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-lg font-bold text-blue-700">
                              PKR {record.charges.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {record.totalMedicines} medicines
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">
                              {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.createdAt ? new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                              Staff: {record.PharmacyPerson}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleViewDetails(record)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 text-sm"
                              title="View Details"
                            >
                              <Eye className="w-3 h-3" />
                              Details
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(record)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-sm"
                              title="Print Receipt"
                            >
                              <Printer className="w-3 h-3" />
                              Receipt
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record._id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1 text-sm"
                              title="Delete Record"
                            >
                              🗑️ Delete
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
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredData.length} of {walkInRecords?.length || 0} total records
                    {selectedDate && ` for ${selectedDate}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Revenue: PKR {filteredData.reduce((sum, r) => sum + r.charges, 0).toLocaleString()} | 
                    Total Medicines: {filteredData.reduce((sum, r) => sum + r.totalMedicines, 0)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalkInPharmacyRecords;