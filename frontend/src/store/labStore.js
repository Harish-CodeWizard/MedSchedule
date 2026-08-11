// Updated labStore.js
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const labStore = create((set) => ({
  labRecords: [],
  singleRecord: null,
  loading: false,
  error: null,
 
createLabRecord: async (recordData) => {
  set({ loading: true, error: null });
  try {
  
    const labRecordPayload = {
      patientId: recordData.patientId,
      patientName: recordData.patientName,
      patientUniqueId: recordData.patientUniqueId,
      age: recordData.age,
      gender: recordData.gender,
      doctorId: recordData.doctorId,
      doctorName: recordData.doctorName,
      testName: recordData.testName,
      category: recordData.category,
      diagnosis: recordData.diagnosis || '',
      overallNotes: recordData.overallNotes || '',
      instructions: recordData.instructions || '',
      parameters: recordData.parameters,
      performedBy: recordData.performedBy || 'Lab Technician', // This is undefined in your data!
      performedDate: recordData.performedDate || new Date().toISOString().split('T')[0],
      priority: recordData.priority || 'Routine',
      status: 'Completed'
    };
    
    
    const labRecordResponse = await axiosInstance.post('/lab', labRecordPayload);
    
    // set(state => ({
    //   labRecords: [...state.labRecords, labRecordResponse.data.data],
    //   loading: false
    // }));
    set(state => ({
  labRecords: Array.isArray(state.labRecords)
    ? [...state.labRecords, labRecordResponse.data.data]
    : [labRecordResponse.data.data],
  loading: false
}));

    
    return { success: true, data: labRecordResponse.data };
  } catch (error) {
    console.error("Error creating lab record:", error);
    set({ 
      error: error.response?.data?.message || error.message || 'Failed to create lab record', 
      loading: false 
    });
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
},

  /* ================= GET ALL PATIENTS ================= */
  getAllLabRecord: async () => {
    try {
      set({ loading: true });

      const res = await axiosInstance.get("/lab");

      set({ labRecords: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch reports");
    } finally {
      set({ loading: false });
    }
  },
  




  /* ================= DELETE deleteLabRecord ================= */
  deleteLabRecord: async (id) => {
    try {
      set({ loading: true });

     await axiosInstance.delete(`/lab/${id}`);

      set((state) => ({
        labRecords: state.labRecords.filter((p) => p._id !== id),
      }));

      toast.success("Report deleted successfully");
      return true;
    } catch (error) {
      console.log(error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },




  // Clear single record
  clearSingleRecord: () => set({ singleRecord: null }),
}));

export default labStore;