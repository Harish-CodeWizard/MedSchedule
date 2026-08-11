import Patient from "../models/PatientModel.js";
import LabRecord from "../models/labRecordModel.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";



export const createLabRecord = catchAsyncError(async (req, res, next) => {
  try {
    const {
      patientId,
      patientName,
      patientUniqueId,
      age,
      gender,
      doctorId,
      doctorName,
      testName,
      category,
      diagnosis,
      overallNotes,
      instructions,
      parameters,
      performedBy,
      performedDate,
      priority,
      xRay
    } = req.body;
    
    console.log('Incoming data:', req.body);
    
    // Validate required fields
    if (!patientId || !patientName || !testName || !category || !parameters || parameters.length === 0) {
      return next(new ErrorHandler('Please fill all required fields including test parameters', 400));
    }
    
    // Create record directly (no transformation needed)
    const record = await LabRecord.create({
      patientId,
      patientName,
      patientUniqueId,
      age: Number(age),
      gender,
      doctorId,
      doctorName,
      testName,
      category,
      diagnosis: diagnosis || '',
      overallNotes: overallNotes || '',
      instructions: instructions || '',
      parameters,
      performedBy: performedBy || 'Lab Technician',
      performedDate: performedDate ? new Date(performedDate) : new Date(),
      priority: priority || 'Routine',
      status: 'Completed',
      xRay,
    });
    
    // Update patient's test status - CORRECTED VERSION
    try {
      // First find the patient
      const patient = await Patient.findById(patientId);
      
      if (patient && patient.recommendedTests) {
        // Find and update the specific test
        let testUpdated = false;
        
        const updatedRecommendedTests = patient.recommendedTests.map(testGroup => {
          // Check if this group has the test
          const hasTest = testGroup.tests?.some(test => test.testName === testName);
          
          if (hasTest) {
            testUpdated = true;
            const updatedTests = testGroup.tests.map(test => {
              if (test.testName === testName) {
                return {
                  ...test.toObject(),
                  status: 'Completed',
                  completedDate: new Date(),
                  performedBy: performedBy || 'Lab Technician',
                  result: parameters.map(p => `${p.parameter}: ${p.value}`).join(', ')
                };
              }
              return test;
            });
            
            return {
              ...testGroup.toObject(),
              tests: updatedTests
            };
          }
          return testGroup;
        });
        
        if (testUpdated) {
          await Patient.findByIdAndUpdate(
            patientId,
            { recommendedTests: updatedRecommendedTests },
            { new: true }
          );
          console.log('Patient test status updated successfully');
        } else {
          console.log('Test not found in patient recommended tests');
        }
      }
    } catch (error) {
      console.log('Patient test status update skipped:', error.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Lab record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Error in createLabRecord:', error);
    return next(new ErrorHandler(error.message, 500));
  }
});


export const getLabRecordsByPatient = catchAsyncError(async (req, res, next) => {
  const { patientId } = req.params;
  
  const records = await LabRecord.find({ patientId })
    .sort({ performedDate: -1 })
    .select('-__v');
  
  res.status(200).json({
    success: true,
    count: records.length,
    data: records
  });
});


export const getAllLabRecords = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 20, search = '', status = '', dateFrom = '', dateTo = '' } = req.query;
  
  let query = {};
  
  // Search filter
  if (search) {
    query.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { patientUniqueId: { $regex: search, $options: 'i' } },
      { testName: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }
  
  // Date range filter
  if (dateFrom || dateTo) {
    query.performedDate = {};
    if (dateFrom) query.performedDate.$gte = new Date(dateFrom);
    if (dateTo) query.performedDate.$lte = new Date(dateTo);
  }
  
  const records = await LabRecord.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('patientId', 'name age gender bloodGroup')
    .populate('doctorId', 'name specialist');
  
  const total = await LabRecord.countDocuments(query);
  
  res.status(200).json({
    success: true,
    records,
    pagination: {
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalRecords: total,
      limit: parseInt(limit)
    }
  });
});


// @desc    Get single lab record
// @route   GET /api/lab-records/:id
// @access  Private
export const getLabRecordById = catchAsyncError(async (req, res, next) => {
  const record = await LabRecord.findById(req.params.id)
    .populate('patientId')
    .populate('doctorId', 'name specialist email');
  
  if (!record) {
    return next(new ErrorHandler('Lab record not found', 404));
  }
  
  res.status(200).json({
    success: true,
    record
  });
});



// @desc    Update lab record
// @route   PUT /api/lab-records/:id
// @access  Private
export const updateLabRecord = catchAsyncError(async (req, res, next) => {
  const {
    testName,
    result,
    normalRange,
    unit,
    notes,
    status,
    performedBy,
    performedDate
  } = req.body;
  
  let record = await LabRecord.findById(req.params.id);
  
  if (!record) {
    return next(new ErrorHandler('Lab record not found', 404));
  }
  
  // Update fields
  if (testName) record.testName = testName;
  if (result) record.result = result;
  if (normalRange !== undefined) record.normalRange = normalRange;
  if (unit !== undefined) record.unit = unit;
  if (notes !== undefined) record.notes = notes;
  if (status) record.status = status;
  if (performedBy) record.performedBy = performedBy;
  if (performedDate) record.performedDate = performedDate;
  
  record = await record.save();
  
  // Also update patient's test result if status is completed
  if (status === 'Completed' && result) {
    await Patient.findByIdAndUpdate(
      record.patientId,
      {
        $set: {
          'recommendedTests.$[elem].status': 'Completed',
          'recommendedTests.$[elem].result': result,
          'recommendedTests.$[elem].completedDate': Date.now()
        }
      },
      {
        arrayFilters: [{ 'elem.testName': record.testName }],
        new: true
      }
    );
  }
  
  res.status(200).json({
    success: true,
    message: 'Lab record updated successfully',
    record
  });
});


export const deleteLabRecord = catchAsyncError(async (req, res, next) => {
  const record = await LabRecord.findById(req.params.id);
  
  if (!record) {
    return next(new ErrorHandler('Lab record not found', 404));
  }
  
  await record.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Lab record deleted successfully'
  });
});

// @desc    Get pending tests
// @route   GET /api/lab-records/pending
// @access  Private
export const getPendingTests = catchAsyncError(async (req, res, next) => {
  const pendingTests = await LabRecord.find({ status: 'Pending' })
    .sort({ createdAt: -1 })
    .populate('patientId', 'name age gender uniqueID')
    .populate('doctorId', 'name specialist');
  
  res.status(200).json({
    success: true,
    count: pendingTests.length,
    pendingTests
  });
});

// @desc    Search lab records
// @route   GET /api/lab-records/search/:query
// @access  Private
export const searchLabRecords = catchAsyncError(async (req, res, next) => {
  const { query } = req.params;
  
  const records = await LabRecord.find({
    $or: [
      { patientName: { $regex: query, $options: 'i' } },
      { patientUniqueId: { $regex: query, $options: 'i' } },
      { testName: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('patientId', 'name age gender')
    .populate('doctorId', 'name specialist');
  
  res.status(200).json({
    success: true,
    count: records.length,
    records
  });
});

// @desc    Get lab statistics
// @route   GET /api/lab-records/statistics
// @access  Private
export const getLabStatistics = catchAsyncError(async (req, res, next) => {
  const totalTests = await LabRecord.countDocuments();
  const completedTests = await LabRecord.countDocuments({ status: 'Completed' });
  const pendingTests = await LabRecord.countDocuments({ status: 'Pending' });
  const cancelledTests = await LabRecord.countDocuments({ status: 'Cancelled' });
  const urgentTests = await LabRecord.countDocuments({ priority: 'Urgent' });
  
  // Get today's tests
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTests = await LabRecord.countDocuments({
    createdAt: { $gte: today }
  });
  
  // Get tests by category
  const testsByCategory = await LabRecord.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Get monthly statistics for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyStats = await LabRecord.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
  
  res.status(200).json({
    success: true,
    statistics: {
      totalTests,
      completedTests,
      pendingTests,
      cancelledTests,
      urgentTests,
      todayTests,
      testsByCategory,
      monthlyStats
    }
  });
});

// @desc    Get tests by patient
// @route   GET /api/lab-records/patient/:patientId
// @access  Private
export const getTestsByPatient = catchAsyncError(async (req, res, next) => {
  const { patientId } = req.params;
  
  const records = await LabRecord.find({ patientId })
    .sort({ createdAt: -1 })
    .populate('doctorId', 'name specialist');
  
  res.status(200).json({
    success: true,
    count: records.length,
    records
  });
});

// @desc    Get recent lab activities
// @route   GET /api/lab-records/recent
// @access  Private
export const getRecentActivities = catchAsyncError(async (req, res, next) => {
  const recentActivities = await LabRecord.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('patientId', 'name uniqueID')
    .populate('doctorId', 'name');
  
  res.status(200).json({
    success: true,
    recentActivities
  });
});

// @desc    Get tests for today
// @route   GET /api/lab-records/today
// @access  Private
export const getTodayTests = catchAsyncError(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTests = await LabRecord.find({
    createdAt: { $gte: today }
  })
    .sort({ createdAt: -1 })
    .populate('patientId', 'name age gender')
    .populate('doctorId', 'name specialist');
  
  res.status(200).json({
    success: true,
    count: todayTests.length,
    todayTests
  });
});

// @desc    Update test status
// @route   PATCH /api/lab-records/:id/status
// @access  Private
export const updateTestStatus = catchAsyncError(async (req, res, next) => {
  const { status, result, notes } = req.body;
  
  let record = await LabRecord.findById(req.params.id);
  
  if (!record) {
    return next(new ErrorHandler('Lab record not found', 404));
  }
  
  if (status) record.status = status;
  if (result) record.result = result;
  if (notes !== undefined) record.notes = notes;
  
  if (status === 'Completed') {
    record.completedAt = Date.now();
    record.performedBy = req.user?.name || 'System';
  }
  
  record = await record.save();
  
  res.status(200).json({
    success: true,
    message: 'Test status updated successfully',
    record
  });
});

// @desc    Upload test report
// @route   POST /api/lab-records/:id/upload-report
// @access  Private
export const uploadTestReport = catchAsyncError(async (req, res, next) => {
  const { reportUrl } = req.body;
  
  if (!reportUrl) {
    return next(new ErrorHandler('Report URL is required', 400));
  }
  
  let record = await LabRecord.findById(req.params.id);
  
  if (!record) {
    return next(new ErrorHandler('Lab record not found', 404));
  }
  
  record.reportUrl = reportUrl;
  record = await record.save();
  
  res.status(200).json({
    success: true,
    message: 'Report uploaded successfully',
    record
  });
});