import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
const prescriptionStore = create((set) => ({
  medicines: [],
  singleMedicine: null,
  loading: false,

  /* ================= CREATE Pharmacy Record ================= */
  addPresception: async (prescriptionData) => {
    console.log("Sending to backend:", prescriptionData);
    try {
      set({ loading: true });

      const res = await axiosInstance.post("/otherActive", prescriptionData);

      console.log("Backend response:", res.data);
      
      if (res.data.success) {
        // Update local state with new record
        set((state) => ({ 
          medicines: [res.data.medicine, ...state.medicines]
        }));
        toast.success(res.data.message || "Pharmacy record added successfully");
        return { success: true, data: res.data.medicine };
      } else {
        toast.error(res.data.message || "Failed to add record");
        return { success: false };
      }
    } catch (error) {
      console.error("Error in addPresception:", error);
      const errorMessage = error?.response?.data?.message || "Failed to add pharmacy record";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  /* ================= GET ALL Pharmacy Records ================= */
  getAllPresception: async () => {
    try {
      set({ loading: true });

      const res = await axiosInstance.get("/otherActive");

      if (res.data.success) {
        set({ medicines: res.data.medicine });
      } else {
        toast.error(res.data.message || "Failed to fetch pharmacy records");
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch pharmacy records";
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },


  /* ================= DELETE Medicines ================= */
  deletePresception: async (id) => {
    try {
      set({ loading: true });

      await axiosInstance.delete(`/otherActive/${id}`);

      set((state) => ({
        medicines: state.medicines.filter((p) => p._id !== id),
      }));

      toast.success("Medicines deleted successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete Medicines");
      return false;
    } finally {
      set({ loading: false });
    }
  },








  /* =================  clearSinglePrescription ================= */
  clearSinglePrescription: () => set({ singlePrescription: null }),
}));

export default prescriptionStore;
