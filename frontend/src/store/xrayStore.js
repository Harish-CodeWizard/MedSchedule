import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const xrayStore = create((set) => ({
  xrayRecords: [],
  singleRecord: null,
  loading: false,
  error: null,
  
  /* ================= CREATE X-RAY RECORD ================= */
  createXrayRecord: async (recordData) => {
    set({ loading: true, error: null });
    try {
      // Prepare payload according to backend schema
     
 
      const response = await axiosInstance.post('/xray', recordData,{
         headers: {
        'Content-Type': 'multipart/form-data',
      },
      });
      
      // set(state => ({
      //   xrayRecords: [...state.xrayRecords, response.data.data],
      //   loading: false
      // }));
          set(state => ({
  xrayRecords: Array.isArray(state.xrayRecords)
    ? [...state.xrayRecords, response.data.data]
    : [response.data.data],
  loading: false
}));
      
      toast.success('X-ray record created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating x-ray record:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create x-ray record';
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  /* ================= CREATE WALK-IN X-RAY RECORD ================= */
  createWalkInXrayRecord: async (formData) => {
    
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/xray/walkin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      set(state => ({
        xrayRecords: Array.isArray(state.xrayRecords)
          ? [...state.xrayRecords, response.data.data]
          : [response.data.data],
        loading: false
      }));
      
      toast.success('Walk-in X-ray patient registered successfully!');
      return { 
        success: true, 
        data: response.data,
        message: response.data.message || 'Patient registered successfully'
      };
    } catch (error) {
      console.error("Error creating walk-in x-ray record:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to register walk-in patient';
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },



/* ================= WALK-IN X-RAY RECORDS ================= */

// Get all walk-in X-ray records
getAllWalkInXrayRecords: async (page = 1, limit = 20, filters = {}) => {
  try {
    set({ loading: true, error: null });
    
    const res = await axiosInstance.get("/xray/walkin/all", {
      params: { 
        page, 
        limit,
        ...filters
      }
    });
    
    set({ loading: false });
    
    return {
      records: res.data.records || [],
      pagination: res.data.pagination || {
        totalPages: 1,
        currentPage: 1,
        totalRecords: 0,
        limit: limit
      }
    };
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "Failed to fetch walk-in x-ray records";
    set({ 
      error: errorMessage, 
      loading: false 
    });
    toast.error(errorMessage);
    return {
      records: [],
      pagination: {
        totalPages: 1,
        currentPage: 1,
        totalRecords: 0,
        limit: limit
      }
    };
  }
},

// Get walk-in X-ray statistics
getWalkInXrayStatistics: async () => {
  try {
    set({ loading: true, error: null });
    
    const res = await axiosInstance.get("/xray/walkin/statistics");
    
    set({ loading: false });
    return res.data.data || res.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "Failed to fetch walk-in x-ray statistics";
    set({ 
      error: errorMessage, 
      loading: false 
    });
    
    return {
      totalRecords: 0,
      todayRecords: 0,
      thisWeekRecords: 0,
      thisMonthRecords: 0,
      categoryStats: [],
      priorityStats: [],
      monthlyStats: [],
      technicianStats: []
    };
  }
},

// Get single walk-in X-ray record
getWalkInXrayRecordById: async (id) => {
  try {
    set({ loading: true, error: null });
    
    const res = await axiosInstance.get(`/xray/walkin/${id}`);
    
    set({ 
      singleRecord: res.data.data || res.data,
      loading: false 
    });
    
    return res.data.data || res.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "Failed to fetch walk-in x-ray record";
    set({ 
      error: errorMessage, 
      loading: false 
    });
    toast.error(errorMessage);
    return null;
  }
},

// Search walk-in X-ray records
searchWalkInXrayRecords: async (query, filters = {}) => {
  try {
    set({ loading: true, error: null });
    
    const res = await axiosInstance.get("/xray/walkin/search", {
      params: { 
        q: query,
        ...filters
      }
    });
    
    set({ loading: false });
    
    return {
      records: res.data.records || [],
      pagination: res.data.pagination || {
        totalPages: 1,
        currentPage: 1,
        totalRecords: 0,
        limit: 20
      }
    };
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "Failed to search walk-in x-ray records";
    set({ 
      error: errorMessage, 
      loading: false 
    });
    toast.error(errorMessage);
    return {
      records: [],
      pagination: {
        totalPages: 1,
        currentPage: 1,
        totalRecords: 0,
        limit: 20
      }
    };
  }
},

// Update walk-in X-ray record
updateWalkInXrayRecord: async (id, updateData) => {
  try {
    set({ loading: true, error: null });
    
    const res = await axiosInstance.put(`/xray/walkin/${id}`, updateData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    set({ loading: false });
    
    toast.success("Walk-in X-ray record updated successfully");
    return { success: true, data: res.data.data };
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "Failed to update walk-in x-ray record";
    set({ 
      error: errorMessage, 
      loading: false 
    });
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
},

// Delete walk-in X-ray record
deleteWalkInXrayRecord: async (id) => {
  try {
    set({ loading: true, error: null });
    
    await axiosInstance.delete(`/xray/walkin/${id}`);
    
    set({ loading: false });
    
    toast.success("Walk-in X-ray record deleted successfully");
    return true;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || "Failed to delete walk-in x-ray record";
    set({ 
      error: errorMessage, 
      loading: false 
    });
    toast.error(errorMessage);
    return false;
  }
},


  /* ================= GET ALL X-RAY RECORDS ================= */
  getAllXrayRecord: async (page = 1, limit = 20) => {
    try {
      set({ loading: true, error: null });
      
      const res = await axiosInstance.get("/xray", {
        params: { page, limit }
      });
      
      set({ 
        xrayRecords: res.data.records || [],
        loading: false 
      });
      
      return {
        records: res.data.records || [],
        pagination: res.data.pagination || {
          totalPages: 1,
          currentPage: 1,
          totalRecords: 0,
          limit: limit
        }
      };
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch x-ray records";
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return {
        records: [],
        pagination: {
          totalPages: 1,
          currentPage: 1,
          totalRecords: 0,
          limit: limit
        }
      };
    }
  },

  /* ================= GET SINGLE X-RAY RECORD ================= */
  getXrayRecordById: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const res = await axiosInstance.get(`/xray/${id}`);
      
      set({ 
        singleRecord: res.data.data || res.data,
        loading: false 
      });
      
      return res.data.data || res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch x-ray record";
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return null;
    }
  },

  /* ================= GET X-RAY STATISTICS ================= */
  getXrayStatistics: async () => {
    try {
      set({ loading: true, error: null });
      
      const res = await axiosInstance.get("/xray/statistics");
      
      set({ loading: false });
      return res.data.data || res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch x-ray statistics";
      set({ 
        error: errorMessage, 
        loading: false 
      });
      
      // Return default stats if API fails
      return {
        totalXrays: 0,
        pendingXrays: 0,
        completedXrays: 0,
        todayXrays: 0
      };
    }
  },

  /* ================= DELETE X-RAY RECORD ================= */
  deleteXrayRecord: async (id) => {
    try {
      set({ loading: true, error: null });
      
      await axiosInstance.delete(`/xray/${id}`);
      
      set((state) => ({
        xrayRecords: state.xrayRecords.filter((record) => record._id !== id),
        loading: false
      }));
      
      toast.success("X-ray record deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete x-ray record";
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return false;
    }
  },

  /* ================= UPDATE X-RAY RECORD ================= */
  updateXrayRecord: async (id, updateData) => {
    try {
      set({ loading: true, error: null });
      
      const res = await axiosInstance.put(`/xray/${id}`, updateData);
      
      set((state) => ({
        xrayRecords: state.xrayRecords.map(record => 
          record._id === id ? res.data.data : record
        ),
        singleRecord: res.data.data,
        loading: false
      }));
      
      toast.success("X-ray record updated successfully");
      return { success: true, data: res.data.data };
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to update x-ray record";
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  /* ================= SEARCH X-RAY RECORDS ================= */
  searchXrayRecords: async (query, filters = {}) => {
    try {
      set({ loading: true, error: null });
      
      const res = await axiosInstance.get("/xray/search", {
        params: { query, ...filters }
      });
      
      set({ 
        xrayRecords: res.data.records || [],
        loading: false 
      });
      
      return {
        records: res.data.records || [],
        pagination: res.data.pagination || {
          totalPages: 1,
          currentPage: 1,
          totalRecords: 0,
          limit: 20
        }
      };
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to search x-ray records";
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return {
        records: [],
        pagination: {
          totalPages: 1,
          currentPage: 1,
          totalRecords: 0,
          limit: 20
        }
      };
    }
  },

  /* ================= CLEAR SINGLE RECORD ================= */
  clearSingleRecord: () => set({ singleRecord: null }),
  
  /* ================= CLEAR ERROR ================= */
  clearError: () => set({ error: null }),
  
  /* ================= RESET STATE ================= */
  resetXrayStore: () => set({
    xrayRecords: [],
    singleRecord: null,
    loading: false,
    error: null
  })
}));

export default xrayStore;