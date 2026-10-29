import axios from "axios";

const defaultBaseURL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/api"
  : "https://placement-hub-web.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  withCredentials: true,
});