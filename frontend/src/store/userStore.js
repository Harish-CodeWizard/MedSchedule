import { create } from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import toast from "react-hot-toast"

const userStore = create((set) => ({
  allUsers:[],
  user: null,
  singleUser:null,
  loading: false,
  isAuth: false,
isCheckingAuth:true,



checkAuth:async ()=>{
    try {
    const res = await axiosInstance.get("/user/me")
    set({isAuth:true, user:res.data.user})
    // console.log(res.data.user)
} catch (error) {
    console.log("Error in checkAuth:",error)
        set({isAuth:false, user:null})
    }finally{
        set({isCheckingAuth:false})
    }
},

// getAllUsers
getAllUsers:async ()=>{
    try {
    const res = await axiosInstance.get("/user/getAllUsers")
    set({allUsers:res.data.users})
} catch (error) {
    console.log("Error in checkAuth:",error)
        set({user:null})
    }finally{
        set({isCheckingAuth:false})
    }
},
  /* ================= GET USER BY ID ================= */
  getUserById: async (id) => {
    try {
      set({ loading: true });

      const res = await axiosInstance.get(`/user/${id}`);
      set({ singleUser:res.data.user });
    } catch (error) {
      toast.error(error?.response?.data?.message || "User not found");
    } finally {
      set({ loading: false });
    }
  },

  /* ================= REGISTER ================= */
  registerUser: async (formData) => {
    try {
      set({ loading: true });
      await axiosInstance.post('/user/register', formData);

toast.success("Registration successful! Please verify your email.");


      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  

  /* ================= LOGIN ================= */
  loginUser: async (formData) => {
    try {
      set({ loading: true });
      const { data } = await axiosInstance.post('/user/login', formData);
      set({
        user: data.user,
        isAuth: true,
      });

      toast.success(data.message);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },



  
  /* ================= VERIFY EMAIL ================= */
  verifyUser: async (formData) => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.post('/user/verifyEmail', formData);

      set({
        user: data.user,
        isAuth: true,
      });

      toast.success('Email verified successfully!');
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /* ================= LOGOUT ================= */
  logoutUser: async () => {
    try {
      set({ loading: true });
   await axiosInstance.get("/user/logout");
      set({
        user: null,
        isAuth: false,
      });

      toast.success('Logged out successfully');
      return true;
    } catch (error) {
      toast.error('Logout failed', error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },




  /* ================= FORGOT PASSWORD ================= */
  forgotPassword: async (formData) => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.post('/user/forgot', formData);

      toast.success(
        'Success',data.message
      );

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },



  /* ================= VERIFY FORGOT CODE ================= */
  verifyForgotCode: async (formData) => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.post('/user/verifyForgot', formData);

      toast.success(
        'Success',
        data.message
      );

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /* ================= NEW PASSWORD ================= */
  newPassword: async ({ password, code }) => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.post('/user/newPassword', {
        password,
        code,
      });

      toast.success(data.message);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },


  /* ================= Update Profile ================= */

  updateProfile: async (formData) => {
    try {
      set({ loading: true });

      const { data } = await axiosInstance.put('/user/update-profile', formData);
  set({ user: data.user });
      toast.success(data.message);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return false;
    } finally {
      set({ loading: false });
    }
  },








}));

export default userStore;
