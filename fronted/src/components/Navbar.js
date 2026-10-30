import React from 'react';
import { Compass, Settings, Sparkles } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  selectedCurrency,
  setSelectedCurrency,
  user,
  onOpenAuth,
  onOpenSettings,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                WanderAI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                Itinerary Planner
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('builder')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentView === 'builder'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Smart Trip Builder</span>
            </button>
            <button
              onClick={() => setCurrentView('saved')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'saved'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Saved Trips
            </button>
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="System Status & API Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <div className="flex items-center">
              {user ? (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[90px] truncate hidden sm:inline">
                    {user.name || 'Traveler'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

