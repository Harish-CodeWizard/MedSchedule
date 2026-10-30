import axios from "axios";

const defaultBaseURL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";
const configuredBaseURL = import.meta.env.VITE_API_URL;
const productionBaseURL = "https://placement-hub-web.onrender.com/api";
const baseURL = configuredBaseURL && !configuredBaseURL.includes("your-medschedule-backend")
  ? configuredBaseURL
  : import.meta.env.MODE === "development"
    ? defaultBaseURL
    : productionBaseURL;

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});