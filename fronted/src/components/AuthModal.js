import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Alex Explorer',
    email: 'traveler@example.com',
    password: 'password123'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      id: 'user-' + Date.now(),
      name: formData.name || 'Traveler',
      email: formData.email
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {user ? 'Traveler Profile' : isSignUp ? 'Create Traveler Account' : 'Sign In to WanderAI'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          <div className="space-y-4 text-center py-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">{user.name}</h4>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-100">
              ✨ Syncing itineraries with Supabase Auth & Cloud Database
            </div>

            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Explorer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="traveler@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
              >
                {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{isSignUp ? 'Create Free Account' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLogin({
                    id: 'guest-101',
                    name: 'Guest Traveler',
                    email: 'guest@wanderai.app'
                  });
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
              >
                Continue as Guest / Demo
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

