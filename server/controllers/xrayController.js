import Patient from "../models/PatientModel.js";
import XrayRecord from "../models/xrayRecordModel.js";
import ErrorHandler from "../middleware/error.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { cloudinary } from "../config/cloudinary.js";
import { upload } from '../middleware/uploadMiddleware.js';
import WalkInXray from "../models/walkinXrayModel.js";
// Utility function to delete images from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
    console.log(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

// Create X-ray Record with Cloudinary
export const createXrayRecord = [
  // Handle file uploads
  upload.array('images', 10),
  
  // Process request
  catchAsyncError(async (req, res, next) => {
    try {
      console.log('Body data:', req.body);
      console.log('Files uploaded:', req.files);
      
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
        notes,
        performedBy,
        performedDate,
        priority,
      } = req.body;
      
      const files = req.files;
      
      // Validate required fields
      if (!patientId || !patientName || !testName || !category) {
        return next(new ErrorHandler('Please fill all required fields', 400));
      }
      
      // Validate files
      if (!files || files.length === 0) {
        return next(new ErrorHandler('At least one x-ray image is required', 400));
      }
      
      // Parse notes (if sent as JSON string)
      let imageNotes = [];
      if (notes) {
        try {
          imageNotes = JSON.parse(notes);
        } catch (e) {
          imageNotes = Array.isArray(notes) ? notes : [];
        }
      }
      
      // Create records array from uploaded Cloudinary files
      const records = files.map((file, index) => ({
        image: file.path, // Cloudinary URL
        cloudinary_id: file.filename, // Cloudinary public_id
        note: imageNotes[index] || '',
        filename: file.originalname
      }));
      
      console.log('Created records with Cloudinary URLs:', records);
      
      // Create x-ray record in database
      const xrayRecord = await XrayRecord.create({
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
        records,
        performedBy: performedBy || 'X-ray Technician',
        performedDate: performedDate ? new Date(performedDate) : new Date(),
        priority: priority || 'Routine',
        status: 'Completed',
      });
      
      // Update patient's test status
      try {
        const patient = await Patient.findById(patientId);
        
        if (patient && patient.recommendedTests) {
          let testUpdated = false;
          
          const updatedRecommendedTests = patient.recommendedTests.map(testGroup => {
            const hasTest = testGroup.tests?.some(test => 
              test.testName === testName && test.xRay === true
            );
            
            if (hasTest) {
              testUpdated = true;
              const updatedTests = testGroup.tests.map(test => {
                if (test.testName === testName && test.xRay === true) {
                  return {
                    ...test.toObject(),
                    status: 'Completed',
                    completedDate: new Date(),
                    performedBy: performedBy || 'X-ray Technician',
                    parameters: [], // No parameters for x-ray
                    result: 'X-ray images completed'
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
            console.log('Patient x-ray test status updated successfully');
          }
        }
      } catch (error) {
        console.log('Patient test status update skipped:', error.message);
      }
      
      res.status(201).json({
        success: true,
        message: 'X-ray record created successfully with Cloudinary',
        data: xrayRecord
      });
      
    } catch (error) {
      console.error('Error in createXrayRecord:', error);
      
      // If error occurs, delete uploaded files from Cloudinary
      if (req.files && req.files.length > 0) {
        req.files.forEach(async (file) => {
          await deleteFromCloudinary(file.filename);
        });
      }
      
      return next(new ErrorHandler(error.message, 500));
    }
  })
];

// Get all X-ray Records
export const getAllXrayRecords = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 10, search = '', status = '', dateFrom = '', dateTo = '' } = req.query;
  
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
  
  const records = await XrayRecord.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('patientId', 'name age gender bloodGroup')
    .populate('doctorId', 'name specialist');
  
  const total = await XrayRecord.countDocuments(query);
  
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

// Get X-ray Record by ID
export const getXrayRecordById = catchAsyncError(async (req, res, next) => {
  const record = await XrayRecord.findById(req.params.id)
    .populate('patientId', 'name age gender bloodGroup phone address')
    .populate('doctorId', 'name specialist department');
  
  if (!record) {
    return next(new ErrorHandler('X-ray record not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: record
  });
});

// Get X-ray Statistics
export const getXrayStatistics = catchAsyncError(async (req, res, next) => {
  const totalXrays = await XrayRecord.countDocuments();
  const completedXrays = await XrayRecord.countDocuments({ status: 'Completed' });
  const pendingXrays = await XrayRecord.countDocuments({ status: 'Pending' });
  
  // Today's x-rays
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayXrays = await XrayRecord.countDocuments({
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  });
  
  // Monthly statistics for the current year
  const currentYear = new Date().getFullYear();
  const monthlyStats = [];
  
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(currentYear, month, 1);
    const endDate = new Date(currentYear, month + 1, 1);
    
    const monthlyCount = await XrayRecord.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    });
    
    monthlyStats.push({
      month: month + 1,
      year: currentYear,
      count: monthlyCount
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      totalXrays,
      completedXrays,
      pendingXrays,
      todayXrays,
      monthlyStats
    }
  });
});

// Update X-ray Record
export const updateXrayRecord = catchAsyncError(async (req, res, next) => {
  const record = await XrayRecord.findById(req.params.id);
  
  if (!record) {
    return next(new ErrorHandler('X-ray record not found', 404));
  }
  
  const { records, ...updateData } = req.body;
  
  // If updating records with new images
  if (req.files && req.files.length > 0) {
    const files = req.files;
    const notes = req.body.notes ? JSON.parse(req.body.notes) : [];
    
    // Delete old images from Cloudinary
    if (record.records && record.records.length > 0) {
      for (const oldRecord of record.records) {
        await deleteFromCloudinary(oldRecord.cloudinary_id);
      }
    }
    
    // Create new records array from uploaded Cloudinary files
    updateData.records = files.map((file, index) => ({
      image: file.path,
      cloudinary_id: file.filename,
      note: notes[index] || '',
      filename: file.originalname
    }));
  } 
  // If just updating text fields or notes
  else if (records) {
    if (!Array.isArray(records) || records.length === 0) {
      return next(new ErrorHandler('At least one x-ray image record is required', 400));
    }
    
    // Keep existing cloudinary_id for existing images
    const updatedRecords = records.map((r, index) => {
      const existingRecord = record.records[index];
      return {
        image: r.image,
        cloudinary_id: existingRecord ? existingRecord.cloudinary_id : r.cloudinary_id,
        note: r.note || '',
        filename: r.filename || `image-${index + 1}`
      };
    });
    
    updateData.records = updatedRecords;
  }
  
  const updatedRecord = await XrayRecord.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'X-ray record updated successfully',
    data: updatedRecord
  });
});

// Search X-ray Records
export const searchXrayRecords = catchAsyncError(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    query: searchQuery = '',
    patientId = '',
    doctorId = '',
    category = '',
    priority = '',
    dateFrom = '',
    dateTo = ''
  } = req.query;
  
  let query = {};
  
  // Text search
  if (searchQuery) {
    query.$or = [
      { patientName: { $regex: searchQuery, $options: 'i' } },
      { patientUniqueId: { $regex: searchQuery, $options: 'i' } },
      { testName: { $regex: searchQuery, $options: 'i' } },
      { doctorName: { $regex: searchQuery, $options: 'i' } },
      { diagnosis: { $regex: searchQuery, $options: 'i' } }
    ];
  }
  
  // Individual filters
  if (patientId) query.patientId = patientId;
  if (doctorId) query.doctorId = doctorId;
  if (category) query.category = category;
  if (priority) query.priority = priority;
  
  // Date range filter
  if (dateFrom || dateTo) {
    query.performedDate = {};
    if (dateFrom) query.performedDate.$gte = new Date(dateFrom);
    if (dateTo) query.performedDate.$lte = new Date(dateTo);
  }
  
  const records = await XrayRecord.find(query)
    .sort({ performedDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('patientId', 'name age gender')
    .populate('doctorId', 'name specialist');
  
  const total = await XrayRecord.countDocuments(query);
  
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

// Delete X-ray Record
export const deleteXrayRecord = catchAsyncError(async (req, res, next) => {
  const record = await XrayRecord.findById(req.params.id);
  
  if (!record) {
    return next(new ErrorHandler('X-ray record not found', 404));
  }
  
  // Delete all images from Cloudinary
  if (record.records && record.records.length > 0) {
    for (const imageRecord of record.records) {
      await deleteFromCloudinary(imageRecord.cloudinary_id);
    }
  }
  
  await record.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'X-ray record deleted successfully along with all images'
  });
});













// // Create walk-in X-ray record
// export const createWalkInXrayRecord = async (req, res) => {
//   try {
//     console.log("📥 Received walk-in X-ray request body:", req.body);
//     console.log("📁 Received files:", req.files);

//     const {
//       name,
//       gender,
//       age,
//       phone,
//       testName,
//       category,
//       priority,
//       instructions,
//       overallNotes,
//       performedBy,
//       performedDate,
//       walkIn
//     } = req.body;

//     // Validate required fields
//     if (!name || !gender || !age || !testName || !performedBy) {
//       return res.status(400).json({
//         success: false,
//         message: 'Required fields are missing: name, gender, age, testName, performedBy'
//       });
//     }

//     // Generate unique walk-in ID
//     const walkInId = `WALKIN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

//     // Parse notes if they exist
//     let notes = [];
//     if (req.body.notes) {
//       try {
//         notes = JSON.parse(req.body.notes);
//       } catch (error) {
//         notes = [req.body.notes];
//       }
//     }

//     // Handle uploaded images
//     const images = [];
//     if (req.files && req.files.length > 0) {
//       req.files.forEach((file, index) => {
//         images.push({
//           filename: file.filename || file.originalname,
//           path: file.path || `/uploads/xray/${file.filename}`,
//           mimetype: file.mimetype,
//           size: file.size,
//           note: notes[index] || ''
//         });
//       });
//     }

//     // Create walk-in X-ray record
//     const walkInRecord = new Xray({
//       patientName: name,
//       patientUniqueId: walkInId,
//       age: parseInt(age),
//       gender,
//       phone: phone || null,
//       testName,
//       category,
//       priority,
//       instructions,
//       overallNotes,
//       performedBy,
//       performedDate: performedDate || new Date(),
//       walkIn: walkIn === 'true' || true,
//       status: 'completed',
//       images: images,
//       notes: notes,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     });

//     await WalkInXray.save();

//     console.log("✅ Walk-in X-ray record saved:", walkInRecord._id);

//     res.status(201).json({
//       success: true,
//       message: 'Walk-in X-ray patient registered successfully',
//       data: walkInRecord,
//       walkInId: walkInId
//     });

//   } catch (error) {
//     console.error('❌ Error creating walk-in x-ray:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to register walk-in patient',
//       error: error.message
//     });
//   }
// };























// Create walk-in X-ray record
export const createWalkInXrayRecord = async (req, res) => {
  try {
    console.log("📥 Received walk-in X-ray request body:", req.body);
    console.log("📁 Received files:", req.files);

    const {
      name,
      gender,
      age,
      phone,
      testName,
      category,
      priority,
      instructions,
      overallNotes,
      performedBy,
      performedDate,
      walkIn,
      notes // Add notes parameter
    } = req.body;

    // Validate required fields
    if (!name || !gender || !age || !testName || !performedBy) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing: name, gender, age, testName, performedBy'
      });
    }

    // Generate unique walk-in ID
    const walkInId = `WALKIN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Parse notes if they exist
    let imageNotes = [];
    if (notes) {
      try {
        imageNotes = JSON.parse(notes);
      } catch (error) {
        imageNotes = [notes];
      }
    } else if (req.body.notes) {
      try {
        imageNotes = JSON.parse(req.body.notes);
      } catch (error) {
        imageNotes = [req.body.notes];
      }
    }

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        images.push({
          image: file.path, // Cloudinary URL
          cloudinary_id: file.filename, // Cloudinary public_id
          note: imageNotes[index] || '',
          filename: file.originalname
        });
      });
    }

    // Create walk-in X-ray record - CORRECTED: Use WalkInXray instead of Xray
    const walkInRecord = new WalkInXray({
      patientName: name,
      patientUniqueId: walkInId,
      age: parseInt(age),
      gender,
      phone: phone || null,
      testName,
      category,
      priority: priority || 'routine',
      instructions: instructions || '',
      overallNotes: overallNotes || '',
      performedBy,
      performedDate: performedDate ? new Date(performedDate) : new Date(),
      walkIn: walkIn === 'true' || true,
      status: 'Completed',
      images: images,
      // notes: imageNotes, // Remove this if not in schema
      // createdAt: new Date(), // Auto-generated by timestamps
      // updatedAt: new Date()  // Auto-generated by timestamps
    });

    await walkInRecord.save();

    console.log("✅ Walk-in X-ray record saved:", walkInRecord._id);

    res.status(201).json({
      success: true,
      message: 'Walk-in X-ray patient registered successfully',
      data: walkInRecord,
      walkInId: walkInId
    });

  } catch (error) {
    console.error('❌ Error creating walk-in x-ray:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register walk-in patient',
      error: error.message
    });
  }
};








// Get all X-ray Records
// Get all walk-in X-ray records
export const getAllWalkinXrayRecords = catchAsyncError(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    category = '',
    priority = '',
    status = '',
    dateFrom = '', 
    dateTo = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  let query = {};
  
  // Search filter
  if (search) {
    query.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { patientUniqueId: { $regex: search, $options: 'i' } },
      { testName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { performedBy: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Category filter
  if (category) {
    query.category = category;
  }
  
  // Priority filter
  if (priority) {
    query.priority = priority;
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }
  
  // Date range filter
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(`${dateTo}T23:59:59.999Z`);
  }
  
  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  // IMPORTANT: Use WalkInXray model instead of XrayRecord
  const records = await WalkInXray.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');
  
  const total = await WalkInXray.countDocuments(query);
  
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



export const deleteWalkInXrayRecord = catchAsyncError(async (req, res, next) => {
  const record = await WalkInXray.findById(req.params.id);
  
  if (!record) {
    return next(new ErrorHandler('Walk-in X-ray record not found', 404));
  }
  
  // Delete all images from Cloudinary
  if (record.images && record.images.length > 0) {
    for (const imageRecord of record.images) {
      await deleteFromCloudinary(imageRecord.cloudinary_id);
    }
  }
  
  await record.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Walk-in X-ray record deleted successfully'
  });
});




















// Get single walk-in X-ray record by ID
export const getWalkinXrayRecordById = catchAsyncError(async (req, res, next) => {
  const record = await WalkInXray.findById(req.params.id);
  
  if (!record) {
    return next(new ErrorHandler('Walk-in X-ray record not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: record
  });
});

// Get walk-in X-ray statistics
export const getWalkinXrayStatistics = catchAsyncError(async (req, res, next) => {
  try {
    // Total records
    const totalRecords = await WalkInXray.countDocuments();
    
    // Today's records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayRecords = await WalkInXray.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // This week's records
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const thisWeekRecords = await WalkInXray.countDocuments({
      createdAt: {
        $gte: startOfWeek,
        $lt: tomorrow
      }
    });
    
    // This month's records
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    const thisMonthRecords = await WalkInXray.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lt: nextMonth
      }
    });
    
    // Category-wise statistics
    const categoryStats = await WalkInXray.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Priority-wise statistics
    const priorityStats = await WalkInXray.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Monthly statistics for current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 1);
      
      const monthlyCount = await WalkInXray.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate
        }
      });
      
      monthlyStats.push({
        month: month + 1,
        monthName: new Date(currentYear, month, 1).toLocaleString('default', { month: 'short' }),
        year: currentYear,
        count: monthlyCount
      });
    }
    
    // Technician-wise statistics
    const technicianStats = await WalkInXray.aggregate([
      {
        $group: {
          _id: '$performedBy',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        todayRecords,
        thisWeekRecords,
        thisMonthRecords,
        categoryStats,
        priorityStats,
        monthlyStats,
        technicianStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching walk-in statistics:', error);
    return next(new ErrorHandler('Failed to fetch statistics', 500));
  }
});

// Search walk-in X-ray records
export const searchWalkinXrayRecords = catchAsyncError(async (req, res, next) => {
  const { 
    q = '',
    category = '',
    priority = '',
    status = '',
    technician = '',
    startDate = '',
    endDate = '',
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  let query = {};
  
  // Text search
  if (q) {
    query.$or = [
      { patientName: { $regex: q, $options: 'i' } },
      { patientUniqueId: { $regex: q, $options: 'i' } },
      { testName: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { overallNotes: { $regex: q, $options: 'i' } },
      { instructions: { $regex: q, $options: 'i' } }
    ];
  }
  
  // Filters
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (technician) query.performedBy = { $regex: technician, $options: 'i' };
  
  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(`${endDate}T23:59:59.999Z`);
  }
  
  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const records = await WalkInXray.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');
  
  const total = await WalkInXray.countDocuments(query);
  
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

// Update walk-in X-ray record
export const updateWalkInXrayRecord = [
  upload.array('images', 10),
  
  catchAsyncError(async (req, res, next) => {
    try {
      const record = await WalkInXray.findById(req.params.id);
      
      if (!record) {
        return next(new ErrorHandler('Walk-in X-ray record not found', 404));
      }
      
      const {
        name,
        gender,
        age,
        phone,
        testName,
        category,
        priority,
        instructions,
        overallNotes,
        performedBy,
        performedDate,
        status,
        notes
      } = req.body;
      
      // Update basic fields
      const updateData = {};
      if (name) updateData.patientName = name;
      if (gender) updateData.gender = gender;
      if (age) updateData.age = parseInt(age);
      if (phone !== undefined) updateData.phone = phone || null;
      if (testName) updateData.testName = testName;
      if (category) updateData.category = category;
      if (priority) updateData.priority = priority;
      if (instructions !== undefined) updateData.instructions = instructions;
      if (overallNotes !== undefined) updateData.overallNotes = overallNotes;
      if (performedBy) updateData.performedBy = performedBy;
      if (performedDate) updateData.performedDate = new Date(performedDate);
      if (status) updateData.status = status;
      
      // Handle image updates if new images are uploaded
      if (req.files && req.files.length > 0) {
        // Delete old images from Cloudinary
        if (record.images && record.images.length > 0) {
          for (const imageRecord of record.images) {
            await deleteFromCloudinary(imageRecord.cloudinary_id);
          }
        }
        
        // Parse notes if they exist
        let imageNotes = [];
        if (notes) {
          try {
            imageNotes = JSON.parse(notes);
          } catch (e) {
            imageNotes = Array.isArray(notes) ? notes : [notes];
          }
        }
        
        // Create new images array
        updateData.images = req.files.map((file, index) => ({
          image: file.path,
          cloudinary_id: file.filename,
          note: imageNotes[index] || '',
          filename: file.originalname
        }));
      }
      
      const updatedRecord = await WalkInXray.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Walk-in X-ray record updated successfully',
        data: updatedRecord
      });
      
    } catch (error) {
      console.error('Error updating walk-in x-ray record:', error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
];
