import React from 'react';
import { X, CheckCircle2, Database, Sparkles, Key } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  healthData,
  currency,
  setCurrency
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">System Status & Integrations</h3>
              <p className="text-xs text-slate-500">Supabase, Generative AI & Environment setup</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Connected Services
          </h4>

          {/* AI Engine Status */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-bold text-xs text-slate-900">AI Itinerary Engine</p>
                <p className="text-[11px] text-slate-500">
                  Provider: <span className="font-semibold text-slate-700">{healthData?.ai_provider || 'Intelligent Generator'}</span>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Ready</span>
            </span>
          </div>

          {/* Supabase Status */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-xs text-slate-900">Database & Authentication</p>
                <p className="text-[11px] text-slate-500">
                  {healthData?.supabase_connected ? 'Connected to Supabase PostgreSQL' : 'Active (Local High-Speed Storage Engine)'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
              healthData?.supabase_connected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>{healthData?.supabase_connected ? 'Supabase Linked' : 'Local Storage Mode'}</span>
            </span>
          </div>
        </div>

        {/* Currency Preference */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Default Application Currency
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { code: 'INR', label: '₹ INR (Indian Rupee)' },
              { code: 'USD', label: '$ USD (US Dollar)' },
              { code: 'EUR', label: '€ EUR (Euro)' },
              { code: 'GBP', label: '£ GBP (British Pound)' }
            ].map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-colors ${
                  currency === c.code
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Setup Instructions for User */}
        <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 text-xs space-y-2 text-slate-700">
          <div className="flex items-center space-x-2 font-bold text-blue-900">
            <Key className="w-4 h-4 text-blue-600" />
            <span>How to connect your Live API Keys:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
            <li>
              Open <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">backened/.env</code>
            </li>
            <li>
              Add your Google Gemini API key: <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">GEMINI_API_KEY=AIzaSy...</code>
            </li>
            <li>
              Optional: Add Supabase URL and key to sync directly to cloud PostgreSQL:
              <code className="block bg-white p-2 rounded border border-blue-200 font-mono text-[10px] mt-1">
                SUPABASE_URL=https://your-project.supabase.co<br />
                SUPABASE_KEY=your-anon-key
              </code>
            </li>
            <li>
              SQL Schema file ready at: <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">backened/supabase_schema.sql</code>
            </li>
          </ol>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

