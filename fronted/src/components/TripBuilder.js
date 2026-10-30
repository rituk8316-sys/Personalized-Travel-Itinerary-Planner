import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MapPin, Calendar, CheckCircle2, ChevronRight
} from 'lucide-react';

const loadingTips = [
  "Analyzing top attractions, scenic routes, and hidden gems...",
  "Curating authentic regional dining & local breakfast spots...",
  "Balancing your travel pace for an unhurried, memorable journey...",
  "Optimizing daily transportation routes and estimated budget...",
  "Assembling morning, afternoon, and golden-hour sunset experiences..."
];

export default function TripBuilder({
  initialData,
  onGenerate,
  isGenerating,
  currency,
  setCurrency
}) {
  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = currencySymbols[currency] || '₹';

  // Default dates: tomorrow to +4 days
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endDefault = new Date(tomorrow);
  endDefault.setDate(endDefault.getDate() + 3);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    destination: initialData?.title || 'Goa',
    start_date: formatDate(tomorrow),
    end_date: formatDate(endDefault),
    budget: initialData?.budget || 20000,
    travelers: 2,
    travel_style: initialData?.style || 'Balanced',
    travel_pace: 'Balanced',
    accommodation: 'Standard',
    interests: ['Sightseeing', 'Food', 'Beaches'],
    special_notes: ''
  });

  // Calculate duration
  const [duration, setDuration] = useState(4);

  useEffect(() => {
    try {
      const s = new Date(formData.start_date);
      const e = new Date(formData.end_date);
      const diffTime = Math.abs(e - s);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(isNaN(diffDays) ? 3 : Math.max(diffDays, 1));
    } catch {
      setDuration(3);
    }
  }, [formData.start_date, formData.end_date]);

  // Loading quotes ticker
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const interestOptions = [
    { label: "Sightseeing", icon: "🏛️" },
    { label: "Food & Dining", icon: "🍜" },
    { label: "Beaches", icon: "🏖️" },
    { label: "Nature & Parks", icon: "🌲" },
    { label: "Adventure Sports", icon: "🏄‍♂️" },
    { label: "History & Culture", icon: "🎨" },
    { label: "Shopping & Markets", icon: "🛍️" },
    { label: "Nightlife & Pubs", icon: "🍹" },
    { label: "Wellness & Spa", icon: "🧘‍♀️" }
  ];

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      const updated = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      ...formData,
      currency,
      duration
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Smart Trip Builder</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Design Your Perfect Personalized Itinerary
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
          Tell us about your destination, budget, and travel preferences. Our AI will craft an optimized day-wise plan with authentic local experiences.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Destination & Dates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Destination & Travel Dates</h3>
              <p className="text-xs text-slate-500">Where are you heading and for how long?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Destination City or Region *
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa, Paris, Tokyo, Manali, Rome, Bali..."
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-slate-400 py-0.5">Popular:</span>
                {['Goa', 'Paris', 'Tokyo', 'Manali', 'Dubai', 'Jaipur'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setFormData({ ...formData, destination: city })}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Trip Duration
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold flex items-center justify-between">
                <span>Total Days:</span>
                <span className="text-base">{duration} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Budget & Travelers */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Budget & Companions</h3>
              <p className="text-xs text-slate-500">Coordinate costs and party size</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Total Estimated Budget ({symbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-base">
                  {symbol}
                </span>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm font-bold text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Approx. {symbol}{Math.round(formData.budget / duration).toLocaleString()} per day
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Number of Travelers
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { num: 1, label: "Solo" },
                  { num: 2, label: "Couple" },
                  { num: 4, label: "Family" },
                  { num: 6, label: "Group" }
                ].map((item) => (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => setFormData({ ...formData, travelers: item.num })}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                      formData.travelers === item.num
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>{item.num}</div>
                    <div className="text-[10px] opacity-80">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Travel Style, Pace & Accommodation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Travel Style & Pacing</h3>
              <p className="text-xs text-slate-500">Fine-tune the rhythm and comfort level of your journey</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Travel Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {['Budget', 'Balanced', 'Luxury', 'Adventure', 'Relaxed'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData({ ...formData, travel_style: style })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.travel_style === style
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Travel Pace
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { pace: 'Relaxed', desc: '1-2 spots/day' },
                    { pace: 'Balanced', desc: '3-4 spots/day' },
                    { pace: 'Packed', desc: '5+ spots/day' }
                  ].map((p) => (
                    <button
                      key={p.pace}
                      type="button"
                      onClick={() => setFormData({ ...formData, travel_pace: p.pace })}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        formData.travel_pace === p.pace
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.pace}</div>
                      <div className="text-[10px] opacity-80">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Accommodation Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { tier: 'Budget', desc: 'Hostels / B&B' },
                    { tier: 'Standard', desc: '3-4 Star Hotels' },
                    { tier: 'Luxury', desc: '5-Star Resorts' }
                  ].map((a) => (
                    <button
                      key={a.tier}
                      type="button"
                      onClick={() => setFormData({ ...formData, accommodation: a.tier })}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        formData.accommodation === a.tier
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{a.tier}</div>
                      <div className="text-[10px] opacity-80">{a.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Interests & Special Notes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Interests & Custom Requests</h3>
              <p className="text-xs text-slate-500">Select what excites you most</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Select Your Interests (Multiple)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {interestOptions.map((item) => {
                const isSelected = formData.interests.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => toggleInterest(item.label)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm ring-1 ring-blue-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Special Notes / Dietary / Accessibility (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Vegetarian food preference, avoid steep trekking, traveling with infant, focus on sunset photography..."
              value={formData.special_notes}
              onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-xs text-slate-800"
            ></textarea>
          </div>
        </div>

        {/* Submit Button & Loading State */}
        <div className="pt-2">
          {isGenerating ? (
            <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-3xl shadow-xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
              <h4 className="text-lg font-bold">Generative AI is Crafting Your Itinerary...</h4>
              <p className="text-xs text-blue-100 max-w-md mx-auto italic transition-all duration-300">
                "{loadingTips[tipIndex]}"
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-extrabold text-base shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate My Personalized AI Itinerary</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

      </form>

    </div>
  );
}

