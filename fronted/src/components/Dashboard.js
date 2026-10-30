import React from 'react';
import { 
  Sparkles, PlusCircle, Compass, Calendar, MapPin, 
  Wallet, Users, ArrowRight, Clock, Trash2, Eye
} from 'lucide-react';

export default function Dashboard({
  stats,
  trips,
  onNewTrip,
  onOpenTrip,
  onDeleteTrip,
  onSelectInspiration,
  currency
}) {
  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = currencySymbols[currency] || '₹';

  const inspirations = [
    {
      title: "Goa, India",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
      tag: "Beaches & Heritage",
      days: 4,
      style: "Relaxed",
      budget: 18000
    },
    {
      title: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
      tag: "Art & Gastronomy",
      days: 5,
      style: "Cultural",
      budget: 120000
    },
    {
      title: "Manali, Himachal",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
      tag: "Mountain Adventure",
      days: 5,
      style: "Adventure",
      budget: 22000
    },
    {
      title: "Tokyo, Japan",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
      tag: "Futuristic & Culture",
      days: 6,
      style: "Balanced",
      budget: 160000
    }
  ];

  const upcomingTrips = trips.filter(t => t.status === 'planned');

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white shadow-xl shadow-blue-900/10 p-8 sm:p-10">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Itinerary Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Where to next? Plan your dream journey in seconds.
          </h1>
          <p className="mt-3 text-blue-100 text-sm sm:text-base leading-relaxed">
            Personalized day-wise schedules, local hotspots, transit routes, and smart budget tracking generated instantly by Generative AI.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onNewTrip}
              className="inline-flex items-center space-x-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Create New Trip</span>
            </button>
            <a
              href="#inspirations"
              className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-3 rounded-xl backdrop-blur-sm transition-colors"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Trips</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{stats?.total_trips || trips.length || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Destinations</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{stats?.unique_destinations || trips.length || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Upcoming</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{upcomingTrips.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Budget Tracked</p>
            <h3 className="text-xl font-extrabold text-slate-800">
              {symbol}{(stats?.total_budget || trips.reduce((acc, t) => acc + (t.budget || 0), 0)).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Upcoming Trips Section */}
      {upcomingTrips.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Upcoming Journeys</h2>
            </div>
            <button
              onClick={onNewTrip}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>+ New Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingTrips.slice(0, 3).map((trip) => (
              <div 
                key={trip.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 mb-2">
                        {trip.travel_style || 'Balanced'} • {trip.duration || 3} Days
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {trip.destination}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
                      Planned
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
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
                      <span>Budget: {currencySymbols[trip.currency] || '₹'}{(trip.budget || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenTrip(trip.id)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>View Itinerary</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Inspirations Section */}
      <section id="inspirations" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Popular AI Travel Blueprints</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Click any blueprint to instantly customize and generate an itinerary.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {inspirations.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => onSelectInspiration(item)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-slate-800 backdrop-blur-sm">
                  {item.tag}
                </span>
                <div className="absolute bottom-3 left-3 text-white">
                  <h4 className="font-bold text-base leading-tight">{item.title}</h4>
                  <p className="text-[11px] text-slate-200">{item.days} Days • {item.style}</p>
                </div>
              </div>
              <div className="p-3 bg-white flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Est. {symbol}{item.budget.toLocaleString()}</span>
                <span className="font-bold text-blue-600 group-hover:underline flex items-center">
                  Customize <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Trips List Table */}
      {trips.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Travel Plans</h2>
            <span className="text-xs text-slate-500">{trips.length} saved</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {trips.map((trip) => (
                <div 
                  key={trip.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{trip.destination}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {trip.start_date} → {trip.end_date} • {trip.duration || 3} days • {trip.travelers || 1} traveler(s)
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          {trip.travel_style || 'Balanced'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          {trip.travel_pace || 'Balanced'} pace
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">Budget</p>
                      <p className="font-bold text-sm text-slate-800">
                        {currencySymbols[trip.currency] || '₹'}{(trip.budget || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOpenTrip(trip.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </button>
                      <button
                        onClick={() => onDeleteTrip(trip.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

