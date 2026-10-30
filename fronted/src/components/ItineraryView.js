import React, { useState } from 'react';
import { 
  ArrowLeft, Share2, Printer, RefreshCw, Plus, Edit2, Trash2, 
  MapPin, Clock, Calendar, Wallet, Compass, Utensils,
  Hotel, Car, Sparkles, Check, X
} from 'lucide-react';

export default function ItineraryView({
  itinerary,
  trip,
  onBack,
  onUpdateActivity,
  onDeleteActivity,
  onAddActivity,
  onRegenerateDay,
  onRegenerateItinerary,
  currency
}) {
  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = currencySymbols[currency || trip?.currency] || '₹';

  const [selectedDay, setSelectedDay] = useState(0); // 0 = all days, 1 = day 1, etc.
  const [editingActivity, setEditingActivity] = useState(null);
  const [addingToDay, setAddingToDay] = useState(null);
  const [regeneratingDayNumber, setRegeneratingDayNumber] = useState(null);
  const [dayFeedback, setDayFeedback] = useState('');
  const [tripFeedback, setTripFeedback] = useState('');
  const [showRegenTripModal, setShowRegenTripModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newActivityData, setNewActivityData] = useState({
    title: '',
    time: '10:00 AM',
    location: '',
    description: '',
    category: 'Sightseeing',
    cost: 200
  });

  if (!itinerary) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500">No itinerary data available.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const {
    destination,
    duration,
    estimated_budget,
    actual_estimated_cost,
    summary,
    budget_breakdown = {},
    accommodation = {},
    transportation = [],
    travel_tips = [],
    days = []
  } = itinerary;

  const budgetDelta = estimated_budget - actual_estimated_cost;
  const isUnderBudget = budgetDelta >= 0;
  const budgetPercent = Math.min(Math.round((actual_estimated_cost / (estimated_budget || 1)) * 100), 100);

  // Handle Edit Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingActivity) return;
    setIsProcessing(true);
    await onUpdateActivity(trip.id, editingActivity.id, {
      title: editingActivity.title,
      time: editingActivity.time,
      location: editingActivity.location,
      description: editingActivity.description,
      category: editingActivity.category,
      cost: parseFloat(editingActivity.cost) || 0
    });
    setIsProcessing(false);
    setEditingActivity(null);
  };

  const handleSaveNewActivity = async (e) => {
    e.preventDefault();
    if (!addingToDay) return;
    setIsProcessing(true);
    await onAddActivity({
      trip_id: trip.id,
      day_number: addingToDay,
      ...newActivityData,
      cost: parseFloat(newActivityData.cost) || 0
    });
    setIsProcessing(false);
    setAddingToDay(null);
    setNewActivityData({
      title: '',
      time: '10:00 AM',
      location: destination,
      description: '',
      category: 'Sightseeing',
      cost: 200
    });
  };

  // Handle Regenerate Day
  const handleExecuteRegenDay = async () => {
    if (!regeneratingDayNumber) return;
    setIsProcessing(true);
    await onRegenerateDay(trip.id, regeneratingDayNumber, dayFeedback);
    setIsProcessing(false);
    setRegeneratingDayNumber(null);
    setDayFeedback('');
  };

  // Handle Regenerate Trip
  const handleExecuteRegenTrip = async () => {
    setIsProcessing(true);
    await onRegenerateItinerary(trip.id, tripFeedback);
    setIsProcessing(false);
    setShowRegenTripModal(false);
    setTripFeedback('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const displayedDays = selectedDay === 0 ? days : days.filter((d) => d.day === selectedDay);

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'food':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'adventure':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shopping':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'relaxation':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trips</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={() => setShowRegenTripModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Plan</span>
          </button>
        </div>
      </div>

      {/* Main Trip Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-7 sm:p-9 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm">
              {trip?.travel_style || 'Balanced'} Experience
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 backdrop-blur-sm">
              {duration} Days • {trip?.travelers || 2} Travelers
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 backdrop-blur-sm">
              {trip?.travel_pace || 'Balanced'} Pace
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {destination} Itinerary
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            {summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{trip?.start_date} to {trip?.end_date}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Budget: {symbol}{(estimated_budget || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Breakdown Card (PRD Section 6.6) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span>Budget Overview & Expense Tracking</span>
            </h3>
            <p className="text-xs text-slate-500">Estimated expenses vs. your target budget</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              isUnderBudget ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {isUnderBudget ? `Within Budget (${symbol}${budgetDelta.toLocaleString()} buffer)` : `Exceeds by ${symbol}${Math.abs(budgetDelta).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Estimated Total: {symbol}{(actual_estimated_cost || 0).toLocaleString()}</span>
            <span>Target: {symbol}{(estimated_budget || 0).toLocaleString()}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent > 95 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 4-Category Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
              <Hotel className="w-4 h-4 text-blue-600" />
              <span>Stay / Lodging</span>
            </div>
            <p className="text-lg font-bold text-slate-800 mt-1">
              {symbol}{(budget_breakdown.accommodation || 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Food & Dining</span>
            </div>
            <p className="text-lg font-bold text-slate-800 mt-1">
              {symbol}{(budget_breakdown.food || 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
              <Car className="w-4 h-4 text-purple-600" />
              <span>Transport</span>
            </div>
            <p className="text-lg font-bold text-slate-800 mt-1">
              {symbol}{(budget_breakdown.transportation || 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Activities & Entry</span>
            </div>
            <p className="text-lg font-bold text-slate-800 mt-1">
              {symbol}{(budget_breakdown.activities || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Destination Insights: Stay & Transit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Recommended Accommodation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Hotel className="w-4 h-4" />
              <span>Recommended Stay</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900">{accommodation.name || 'Boutique Hotel & Suites'}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{accommodation.location || 'Central Location'}</p>
            
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(accommodation.highlights || ['Free Wi-Fi', 'Complimentary Breakfast', 'Central']).map((h, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                  ✓ {h}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Estimated Nightly:</span>
            <span className="font-bold text-sm text-slate-900">
              {symbol}{(accommodation.estimated_nightly_cost || 0).toLocaleString()} / night
            </span>
          </div>
        </div>

        {/* Transportation Options & Local Tips */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Car className="w-4 h-4" />
              <span>Local Transportation Guide</span>
            </div>
            
            <div className="space-y-2 mt-2">
              {transportation.map((t, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{t.mode}</span>
                    <span className="text-blue-600">{symbol}{(t.estimated_cost || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {travel_tips.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pro Tip: {travel_tips[0]}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Day Selector Tabs (PRD Section 6.7) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setSelectedDay(0)}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedDay === 0
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Days ({days.length})
        </button>
        {days.map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedDay === d.day
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {/* Day Cards List */}
      <div className="space-y-8">
        {displayedDays.map((dayPlan) => (
          <div 
            key={dayPlan.day}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 print-break"
          >
            
            {/* Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                  D{dayPlan.day}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Day {dayPlan.day}: {dayPlan.theme}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {dayPlan.date || `Day ${dayPlan.day}`} • Est. Day Cost: {symbol}{(dayPlan.estimated_daily_cost || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Day Actions */}
              <div className="flex items-center space-x-2 no-print">
                <button
                  onClick={() => setAddingToDay(dayPlan.day)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
                <button
                  onClick={() => setRegeneratingDayNumber(dayPlan.day)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors flex items-center space-x-1"
                  title="Regenerate this specific day"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Day</span>
                </button>
              </div>
            </div>

            {/* Activities Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Scheduled Activities
              </h4>

              <div className="space-y-3">
                {dayPlan.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-extrabold flex items-center space-x-1 shrink-0 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{act.time}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-bold text-slate-900 text-sm">{act.title}</h5>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(act.category)}`}>
                            {act.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{act.location}</span>
                        </p>
                        {act.description && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0 space-y-1">
                      <span className="text-xs font-extrabold text-slate-800">
                        {act.cost > 0 ? `${symbol}${act.cost.toLocaleString()}` : 'Free'}
                      </span>
                      <div className="flex items-center space-x-1 no-print">
                        <button
                          onClick={() => setEditingActivity(act)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteActivity(trip.id, act.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Recommendations */}
            {dayPlan.meals && dayPlan.meals.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Culinary & Dining Spots
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {dayPlan.meals.map((m, mi) => (
                    <div key={mi} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100/80 text-xs">
                      <span className="font-extrabold text-amber-700 text-[10px] uppercase tracking-wider block">
                        {m.meal_type}
                      </span>
                      <p className="font-bold text-slate-800 mt-0.5">{m.restaurant_name}</p>
                      <p className="text-[11px] text-slate-500">{m.cuisine}</p>
                      <span className="text-[11px] font-semibold text-amber-700 block mt-1">
                        Est. {symbol}{(m.estimated_cost || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Activity</h3>
              <button onClick={() => setEditingActivity(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={editingActivity.time}
                    onChange={(e) => setEditingActivity({ ...editingActivity, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingActivity.category}
                    onChange={(e) => setEditingActivity({ ...editingActivity, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food">Food</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={editingActivity.location}
                  onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Cost ({symbol})</label>
                <input
                  type="number"
                  min="0"
                  value={editingActivity.cost}
                  onChange={(e) => setEditingActivity({ ...editingActivity, cost: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editingActivity.description || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm"
                >
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {addingToDay && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Activity to Day {addingToDay}</h3>
              <button onClick={() => setAddingToDay(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba diving, Sunset beach walk, Wine tasting"
                  value={newActivityData.title}
                  onChange={(e) => setNewActivityData({ ...newActivityData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={newActivityData.time}
                    onChange={(e) => setNewActivityData({ ...newActivityData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newActivityData.category}
                    onChange={(e) => setNewActivityData({ ...newActivityData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food">Food</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="Attraction name or district"
                  value={newActivityData.location}
                  onChange={(e) => setNewActivityData({ ...newActivityData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Cost ({symbol})</label>
                <input
                  type="number"
                  min="0"
                  value={newActivityData.cost}
                  onChange={(e) => setNewActivityData({ ...newActivityData, cost: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows="2"
                  placeholder="Details, entry notes, or what to experience"
                  value={newActivityData.description}
                  onChange={(e) => setNewActivityData({ ...newActivityData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddingToDay(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm"
                >
                  {isProcessing ? 'Adding...' : 'Add to Day'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regenerate Day Modal */}
      {regeneratingDayNumber && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Regenerate Day {regeneratingDayNumber}</h3>
              <button onClick={() => setRegeneratingDayNumber(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide specific instructions for what you'd like to change about this day, or leave blank for a fresh variety of spots.
            </p>

            <textarea
              rows="3"
              placeholder="e.g. More water activities, focus on local street food, avoid crowded forts, romantic beach sunset..."
              value={dayFeedback}
              onChange={(e) => setDayFeedback(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
            ></textarea>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRegeneratingDayNumber(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteRegenDay}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-sm"
              >
                {isProcessing ? 'Generating Day...' : 'Regenerate Day'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Complete Plan Modal */}
      {showRegenTripModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Regenerate Complete Itinerary</h3>
              <button onClick={() => setShowRegenTripModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              The AI will re-plan all days with fresh itineraries, meals, and route optimizations. Add any feedback below:
            </p>

            <textarea
              rows="3"
              placeholder="e.g. Make it more adventure-packed, decrease dining costs, include nightlife options..."
              value={tripFeedback}
              onChange={(e) => setTripFeedback(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
            ></textarea>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenTripModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteRegenTrip}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
              >
                {isProcessing ? 'Re-crafting Itinerary...' : 'Regenerate Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

