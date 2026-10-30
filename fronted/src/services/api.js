import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds for AI generation
});

export const travelApi = {
  // Stats & Health
  getStats: async () => {
    const res = await api.get('/stats');
    return res.data;
  },

  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },

  // Trips CRUD
  getTrips: async () => {
    const res = await api.get('/trips');
    return res.data;
  },

  getTrip: async (tripId) => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },

  createTrip: async (tripData) => {
    const res = await api.post('/trips', tripData);
    return res.data;
  },

  updateTrip: async (tripId, tripData) => {
    const res = await api.put(`/trips/${tripId}`, tripData);
    return res.data;
  },

  deleteTrip: async (tripId) => {
    const res = await api.delete(`/trips/${tripId}`);
    return res.data;
  },

  // Itinerary & AI Generation
  generateItinerary: async (tripData) => {
    const res = await api.post('/itinerary/generate', tripData);
    return res.data;
  },

  getItinerary: async (tripId) => {
    const res = await api.get(`/itinerary/${tripId}`);
    return res.data;
  },

  regenerateItinerary: async (tripId, feedback = '') => {
    const res = await api.post('/itinerary/regenerate', { trip_id: tripId, feedback });
    return res.data;
  },

  regenerateDay: async (tripId, dayNumber, feedback = '') => {
    const res = await api.post('/itinerary/regenerate-day', {
      trip_id: tripId,
      day_number: dayNumber,
      feedback,
    });
    return res.data;
  },

  // Activity Management
  updateActivity: async (tripId, activityId, activityData) => {
    const res = await api.put(`/activities/${activityId}?trip_id=${tripId}`, activityData);
    return res.data;
  },

  deleteActivity: async (tripId, activityId) => {
    const res = await api.delete(`/activities/${activityId}?trip_id=${tripId}`);
    return res.data;
  },

  addActivity: async (activityData) => {
    const res = await api.post('/activities', activityData);
    return res.data;
  },
};

export default travelApi;

