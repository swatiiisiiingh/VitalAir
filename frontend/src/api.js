import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getAdvisory = (lat, lon, location_name, profile) =>
  axios.post(`${API_URL}/advisory`, { lat, lon, location_name, profile }).then((r) => r.data);

export const getHistory = (lat, lon) =>
  axios.get(`${API_URL}/history`, { params: { lat, lon } }).then((r) => r.data);

export const deleteHistory = (id) =>
  axios.delete(`${API_URL}/history/${id}`).then((r) => r.data);

export const getTrend = (lat, lon) =>
  axios.get(`${API_URL}/trend`, { params: { lat, lon } }).then((r) => r.data);

export const getPlan = (lat, lon) =>
  axios.get(`${API_URL}/plan`, { params: { lat, lon } }).then((r) => r.data);
