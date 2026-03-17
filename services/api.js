import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const getMe = () => api.get("/users/me");

// ── Colleges ──────────────────────────────────────────────────────────────────
export const getColleges = () => api.get("/colleges");
export const createCollege = (data) => api.post("/colleges", data);
export const updateCollege = (id, data) => api.put(`/colleges/${id}`, data);
export const deleteCollege = (id) => api.delete(`/colleges/${id}`);

// ── Sections / Courses ────────────────────────────────────────────────────────
export const getSections = (collegeId) =>
  api.get("/sections", { params: collegeId ? { collegeId } : {} });
export const createSection = (data) => api.post("/sections", data);
export const deleteSection = (id) => api.delete(`/sections/${id}`);

// ── Resources ─────────────────────────────────────────────────────────────────
export const getResources = () => api.get("/resources");
export const createResource = (data) => api.post("/resources", data);

// ── Admin User Management ─────────────────────────────────────────────────────
export const getAdminInstructors = (params) =>
  api.get("/admin/instructors", { params });
export const getAdminStudents = (params) =>
  api.get("/admin/students", { params });
export const editUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ── Subjects ──────────────────────────────────────────────────────────────────
export const getSubjects = (params) => api.get("/subjects", { params });
export const createSubject = (data) => api.post("/subjects", data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);

// ── Materials ─────────────────────────────────────────────────────────────────
export const getMaterials = (params) => api.get("/materials", { params });
export const getRecentMaterials = () => api.get("/materials/recent");
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);

// Native fetch instead of Axios — Axios corrupts multipart FormData in React Native
export const uploadMaterial = async (formData) => {
  const token = api.defaults.headers.common["Authorization"];
  const response = await fetch(`${API_URL}/materials`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: token } : {}),
      // NO Content-Type here — fetch sets it automatically with the correct multipart boundary
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw { response: { data } };
  return { data };
};

// Comments
export const getComments = (materialId) =>
  api.get("/comments", { params: { materialId } });
export const createComment = (data) => api.post("/comments", data);
export const updateComment = (id, text) => api.put(`/comments/${id}`, { text });
export const deleteComment = (id) => api.delete(`/comments/${id}`);

// Reading Progress
export const saveProgress = (data) => api.post("/progress", data);
export const getProgress = (materialId) =>
  api.get("/progress", { params: { materialId } });
export const getReadingHistory = () => api.get("/progress/history");

// ── Default export must be LAST ───────────────────────────────────────────────
export default api;

// Profile
export const uploadAvatar = async (formData) => {
  const r = await api.put("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return r;
};

// Instructor
export const getMyMaterials = () => api.get("/materials/mine");

// Admin — instructor approval
export const getInstructorRequests = () =>
  api.get("/admin/instructor-requests");
export const approveInstructor = (id) =>
  api.put(`/admin/instructor-requests/${id}/approve`);
export const rejectInstructor = (id) =>
  api.delete(`/admin/instructor-requests/${id}/reject`);
