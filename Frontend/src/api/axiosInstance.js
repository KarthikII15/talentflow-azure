
// frontend/src/api/axiosInstance.js
import axios from "axios";

// Change this if your backend runs elsewhere (ngrok, etc.)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export default api;
