import axios, { type InternalAxiosRequestConfig } from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (username: string, password: string) =>
  api.post("/api/auth/login", { username, password });

export const signup = (username: string, password: string, profilePhoto?: string) =>
  api.post("/api/auth/signup", { username, password, profilePhoto });

export const getDocumentsStatus = () => api.get("/api/documents/status");

export const uploadDocument = (code: string, file: File) => {
  const form = new FormData();
  form.append("documentType", code);
  form.append("file", file);
  return api.post("/api/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getDocumentResult = (code: string) => api.get(`/api/documents/result/${code}`);

export default api;
