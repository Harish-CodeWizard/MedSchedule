import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const patientStore = create((set) => ({
  patients: [],
  CompletePresception: [],
  singlePatient: null,
  loading: false,

  /* ================= CREATE PATIENT ================= */
  createPatient: async (patientData) => {
    try {
      set({ loading: true });

      const res = await axiosInstance.post("/patient", patientData);

      // update state instantly
      set((state) => ({
        patients: [...state.patients, res.data.patient],
      }));

      toast.success("Patient created successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create patient");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /* ================= GET ALL PATIENTS ================= */
  getAllPatients: async () => {
    try {
      set({ loading: true });

      const res = await axiosInstance.get("/patient");

      set({ patients: res.data.patients });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch patients");
    } finally {
      set({ loading: false });
    }
  },

  /* ================= GET PATIENT BY ID ================= */
  getPatientById: async (id) => {
    try {
      set({ loading: true });

      const res = await axiosInstance.get(`/patient/${id}`);

      set({ singlePatient: res.data.patient });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Patient not found");
    } finally {
      set({ loading: false });
    }
  },

  /* ================= UPDATE PATIENT ================= */
  updatePatient: async (id, updatedData) => {
    console.log(updatedData)
    try {
      set({ loading: true });

      const res = await axiosInstance.put(`/patient/${id}`, updatedData);

      // update list instantly (NO REFRESH REQUIRED)
      set((state) => ({
        patients: state.patients.map((p) =>
          p._id === id ? res.data.patient : p
        ),
        singlePatient: res.data.patient,
      }));

      toast.success("Patient updated successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update patient");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /* ================= DELETE PATIENT ================= */
  deletePatient: async (id) => {
    try {
      set({ loading: true });

      await axiosInstance.delete(`/patient/${id}`);

      set((state) => ({
        patients: state.patients.filter((p) => p._id !== id),
      }));

      toast.success("Patient deleted successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete patient");
      return false;
    } finally {
      set({ loading: false });
    }
  },

/* ================= DELETE MEDICINE ================= */
deleteMedicine: async (patientId, prescriptionId, medicineId) => {
  try {
    set({ loading: true });

    await axiosInstance.delete(
      `/patient/${patientId}/prescription/${prescriptionId}/medicine/${medicineId}`
    );

    set((state) => ({
      singlePatient: {
        ...state.singlePatient,
        prescriptions: state.singlePatient.prescriptions.map((p) =>
          p._id === prescriptionId
            ? {
                ...p,
                medicines: p.medicines.filter(
                  (m) => m._id !== medicineId
                ),
              }
            : p
        ),
      },
    }));

    toast.success("Medicine deleted successfully");
    return true;
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Failed to delete medicine"
    );
    return false;
  } finally {
    set({ loading: false });
  }
},


// In your patientStore.js
getPatientByUniqueId: async (uniqueID) => {
  try {
    set({ loading: true });
    const res = await axiosInstance.get(`/patient/unique/${uniqueID}`);
    set({ singlePatient: res.data.patient });
    return res.data.patient;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Patient not found");
    return null;
  } finally {
    set({ loading: false });
  }
},




/* ================= GET ALL COMPLETED PRESCRIPTIONS ================= */
getCompletePrescriptions: async () => {
  try {
    set({ loading: true });

    const res = await axiosInstance.get("/patient/data");

    set({ CompletePresception: res.data.prescriptions }); // ✅ FIX
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to fetch prescriptions");
  } finally {
    set({ loading: false });
  }
},




  /* ================= CLEAR SINGLE PATIENT ================= */
  clearSinglePatient: () => set({ singlePatient: null }),
}));

export default patientStore;
