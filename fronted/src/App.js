import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TripBuilder from './components/TripBuilder';
import ItineraryView from './components/ItineraryView';
import SavedTrips from './components/SavedTrips';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import { travelApi } from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'builder', 'itinerary', 'saved'
  const [currency, setCurrency] = useState('INR');
  const [user, setUser] = useState({
    id: 'user-demo-123',
    name: 'Alex Explorer',
    email: 'traveler@example.com'
  });

  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(null);
  const [healthData, setHealthData] = useState(null);

  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [builderInitial, setBuilderInitial] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Load initial data
  const fetchData = async () => {
    try {
      const [tripsRes, statsRes, healthRes] = await Promise.allSettled([
        travelApi.getTrips(),
        travelApi.getStats(),
        travelApi.getHealth()
      ]);

      if (tripsRes.status === 'fulfilled') setTrips(tripsRes.value || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (healthRes.status === 'fulfilled') setHealthData(healthRes.value);
    } catch (err) {
      console.warn('Backend connection note:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Generate AI Itinerary
  const handleGenerateItinerary = async (formData) => {
    setIsGenerating(true);
    try {
      const res = await travelApi.generateItinerary(formData);
      if (res && res.itinerary) {
        setCurrentTrip(res.trip);
        setCurrentItinerary(res.itinerary);
        setCurrentView('itinerary');
        fetchData();
        showToast('Personalized itinerary generated successfully!');
      } else {
        showToast('Could not parse itinerary response.', 'error');
      }
    } catch (err) {
      console.error('Error generating itinerary:', err);
      showToast('Error generating itinerary. Please ensure backend is running.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Open existing trip
  const handleOpenTrip = async (tripId) => {
    try {
      const trip = trips.find((t) => t.id === tripId) || (await travelApi.getTrip(tripId));
      const itin = await travelApi.getItinerary(tripId);
      setCurrentTrip(trip);
      setCurrentItinerary(itin);
      setCurrentView('itinerary');
    } catch (err) {
      console.error('Error opening trip:', err);
      showToast('Failed to load trip itinerary.', 'error');
    }
  };

  // Delete trip
  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip and its itinerary?')) return;
    try {
      await travelApi.deleteTrip(tripId);
      showToast('Trip deleted successfully.');
      if (currentTrip?.id === tripId) {
        setCurrentTrip(null);
        setCurrentItinerary(null);
        setCurrentView('dashboard');
      }
      fetchData();
    } catch (err) {
      console.error('Error deleting trip:', err);
      showToast('Failed to delete trip.', 'error');
    }
  };

  // Select Inspiration card from dashboard
  const handleSelectInspiration = (item) => {
    setBuilderInitial(item);
    setCurrentView('builder');
  };

  // Update activity
  const handleUpdateActivity = async (tripId, actId, updates) => {
    try {
      await travelApi.updateActivity(tripId, actId, updates);
      // Reload updated itinerary
      const updatedItin = await travelApi.getItinerary(tripId);
      setCurrentItinerary(updatedItin);
      showToast('Activity updated successfully.');
    } catch (err) {
      console.error('Error updating activity:', err);
      showToast('Failed to update activity.', 'error');
    }
  };

  // Delete activity
  const handleDeleteActivity = async (tripId, actId) => {
    try {
      await travelApi.deleteActivity(tripId, actId);
      const updatedItin = await travelApi.getItinerary(tripId);
      setCurrentItinerary(updatedItin);
      showToast('Activity deleted.');
    } catch (err) {
      console.error('Error deleting activity:', err);
      showToast('Failed to delete activity.', 'error');
    }
  };

  // Add activity
  const handleAddActivity = async (data) => {
    try {
      await travelApi.addActivity(data);
      const updatedItin = await travelApi.getItinerary(data.trip_id);
      setCurrentItinerary(updatedItin);
      showToast('New activity added to day.');
    } catch (err) {
      console.error('Error adding activity:', err);
      showToast('Failed to add activity.', 'error');
    }
  };

  // Regenerate Day
  const handleRegenerateDay = async (tripId, dayNum, feedback) => {
    try {
      const res = await travelApi.regenerateDay(tripId, dayNum, feedback);
      if (res.itinerary) {
        setCurrentItinerary(res.itinerary);
      } else {
        const updatedItin = await travelApi.getItinerary(tripId);
        setCurrentItinerary(updatedItin);
      }
      showToast(`Day ${dayNum} regenerated successfully!`);
    } catch (err) {
      console.error('Error regenerating day:', err);
      showToast('Failed to regenerate day.', 'error');
    }
  };

  // Regenerate Entire Itinerary
  const handleRegenerateItinerary = async (tripId, feedback) => {
    try {
      const res = await travelApi.regenerateItinerary(tripId, feedback);
      if (res.itinerary) {
        setCurrentItinerary(res.itinerary);
      } else {
        const updatedItin = await travelApi.getItinerary(tripId);
        setCurrentItinerary(updatedItin);
      }
      showToast('Entire itinerary regenerated!');
    } catch (err) {
      console.error('Error regenerating itinerary:', err);
      showToast('Failed to regenerate itinerary.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold transition-all transform animate-bounce ${
          notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedCurrency={currency}
        setSelectedCurrency={setCurrency}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentView === 'dashboard' && (
          <Dashboard
            stats={stats}
            trips={trips}
            onNewTrip={() => {
              setBuilderInitial(null);
              setCurrentView('builder');
            }}
            onOpenTrip={handleOpenTrip}
            onDeleteTrip={handleDeleteTrip}
            onSelectInspiration={handleSelectInspiration}
            currency={currency}
          />
        )}

        {currentView === 'builder' && (
          <TripBuilder
            initialData={builderInitial}
            onGenerate={handleGenerateItinerary}
            isGenerating={isGenerating}
            currency={currency}
            setCurrency={setCurrency}
          />
        )}

        {currentView === 'itinerary' && (
          <ItineraryView
            itinerary={currentItinerary}
            trip={currentTrip}
            onBack={() => setCurrentView('dashboard')}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
            onAddActivity={handleAddActivity}
            onRegenerateDay={handleRegenerateDay}
            onRegenerateItinerary={handleRegenerateItinerary}
            currency={currency}
          />
        )}

        {currentView === 'saved' && (
          <SavedTrips
            trips={trips}
            onOpenTrip={handleOpenTrip}
            onDeleteTrip={handleDeleteTrip}
            onNewTrip={() => {
              setBuilderInitial(null);
              setCurrentView('builder');
            }}
            currency={currency}
          />
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        healthData={healthData}
        currency={currency}
        setCurrency={setCurrency}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onLogin={(userData) => setUser(userData)}
        onLogout={() => setUser(null)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white/50 py-6 text-center text-xs text-slate-500 no-print">
        <p>© 2026 WanderAI - Personalized Travel Itinerary Planner • Powered by FastAPI & Generative AI</p>
      </footer>

    </div>
  );
}

export default App;
