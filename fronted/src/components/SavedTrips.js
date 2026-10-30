import React, { useState } from 'react';
import { 
  Calendar, Wallet, Users, Compass, 
  Trash2, Eye, PlusCircle, Search, Filter 
} from 'lucide-react';

export default function SavedTrips({
  trips,
  onOpenTrip,
  onDeleteTrip,
  onNewTrip,
  currency
}) {
  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = currencySymbols[currency] || '₹';

  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState('All');

  const filteredTrips = trips.filter((t) => {
    const matchDest = t.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStyle = styleFilter === 'All' || t.travel_style === styleFilter;
    return matchDest && matchStyle;
  });

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Travel Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, manage, and revisit your personalized travel itineraries.
          </p>
        </div>

        <button
          onClick={onNewTrip}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm text-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Itinerary</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="w-full sm:w-auto text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Travel Styles</option>
            <option value="Budget">Budget</option>
            <option value="Balanced">Balanced</option>
            <option value="Luxury">Luxury</option>
            <option value="Adventure">Adventure</option>
            <option value="Relaxed">Relaxed</option>
          </select>
        </div>
      </div>

      {/* Trip Cards Grid */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No travel plans found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || styleFilter !== 'All'
              ? 'Try adjusting your search terms or filter criteria.'
              : 'You have not saved any travel plans yet. Create your first AI itinerary today!'}
          </p>
          <button
            onClick={onNewTrip}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
          >
            Create New Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
                      {trip.travel_style || 'Balanced'} • {trip.duration || 3} Days
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {trip.destination}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {trip.status === 'planned' ? 'Planned' : 'Active'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{trip.start_date} to {trip.end_date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{trip.travelers || 2} Traveler(s) • {trip.travel_pace || 'Balanced'} pace</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-800">
                      Budget: {currencySymbols[trip.currency] || symbol}{(trip.budget || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {trip.interests && trip.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {trip.interests.slice(0, 3).map((int, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                        {int}
                      </span>
                    ))}
                    {trip.interests.length > 3 && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium">
                        +{trip.interests.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onDeleteTrip(trip.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenTrip(trip.id)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Itinerary</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

