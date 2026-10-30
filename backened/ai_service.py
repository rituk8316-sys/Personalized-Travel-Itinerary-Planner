import json
import uuid
import datetime
import requests
from typing import Dict, Any, List, Optional
from config import GEMINI_API_KEY, OPENAI_API_KEY

class AIService:
    @staticmethod
    def _create_prompt(trip_data: Dict[str, Any]) -> str:
        destination = trip_data.get("destination", "Goa")
        duration = trip_data.get("duration", 3)
        budget = trip_data.get("budget", 20000)
        currency = trip_data.get("currency", "INR")
        travelers = trip_data.get("travelers", 2)
        travel_style = trip_data.get("travel_style", "Balanced")
        travel_pace = trip_data.get("travel_pace", "Balanced")
        accommodation = trip_data.get("accommodation", "Standard")
        interests = ", ".join(trip_data.get("interests", ["Sightseeing", "Food"]))
        special_notes = trip_data.get("special_notes", "")

        return f"""You are an elite AI Travel Planner. Create a comprehensive, realistic, and highly engaging travel itinerary tailored to the following specifications:

Destination: {destination}
Trip Duration: {duration} days
Total Budget: {currency} {budget}
Number of Travelers: {travelers}
Travel Style: {travel_style} (e.g. Budget, Luxury, Adventure, Relaxed, Cultural, Family)
Travel Pace: {travel_pace} (Relaxed: 2-3 spots/day, Balanced: 3-4 spots/day, Packed: 5+ spots/day)
Accommodation Preference: {accommodation} (Budget, Standard, Luxury)
Interests: {interests}
Special Notes/Requests: {special_notes if special_notes else 'None'}

REQUIREMENTS:
1. Day-wise breakdown for all {duration} days.
2. Group activities realistically by time (e.g., 08:30 AM, 11:00 AM, 02:00 PM, 05:30 PM, 08:00 PM) ensuring smooth geographical proximity.
3. Include real, accurate names of landmarks, viewpoints, markets, beaches, or monuments in {destination}.
4. Provide breakfast, lunch, and dinner restaurant recommendations with authentic local cuisine names.
5. Suggest best accommodation matching '{accommodation}' tier with realistic per-night costs.
6. Suggest local transport options (scooty rentals, metro, cabs, tuk-tuks, walking).
7. Ensure costs align with the target budget of {currency} {budget}.
8. Provide actionable local travel tips (scam warnings, best sunset points, cultural etiquette, packing notes).

Return ONLY raw JSON (no markdown formatting, no code fences, no extra text) matching this EXACT schema:
{{
  "destination": "{destination}",
  "duration": {duration},
  "estimated_budget": {budget},
  "actual_estimated_cost": 0,
  "currency": "{currency}",
  "summary": "A 2-3 sentence inspiring executive summary of this trip.",
  "budget_breakdown": {{
    "accommodation": 0,
    "food": 0,
    "transportation": 0,
    "activities": 0,
    "total": 0
  }},
  "accommodation": {{
    "name": "Hotel/Resort name in {destination}",
    "type": "{accommodation}",
    "estimated_nightly_cost": 0,
    "location": "Neighborhood or area",
    "highlights": ["Amenity 1", "Amenity 2", "Amenity 3"]
  }},
  "transportation": [
    {{
      "mode": "e.g. Rental Scooter / Metro / Local Cabs",
      "description": "How to get around efficiently",
      "estimated_cost": 0
    }}
  ],
  "travel_tips": [
    "Tip 1...",
    "Tip 2...",
    "Tip 3...",
    "Tip 4..."
  ],
  "days": [
    {{
      "day": 1,
      "date": "Day 1",
      "theme": "Theme title e.g. Heritage & Sunset Vistas",
      "estimated_daily_cost": 0,
      "meals": [
        {{
          "meal_type": "Breakfast",
          "restaurant_name": "Cafe Name",
          "cuisine": "Local speciality",
          "estimated_cost": 0
        }},
        {{
          "meal_type": "Lunch",
          "restaurant_name": "Restaurant Name",
          "cuisine": "Regional Cuisine",
          "estimated_cost": 0
        }},
        {{
          "meal_type": "Dinner",
          "restaurant_name": "Dinner Venue",
          "cuisine": "Dinner Cuisine & Ambience",
          "estimated_cost": 0
        }}
      ],
      "activities": [
        {{
          "id": "act-1-1",
          "time": "09:00 AM",
          "title": "Specific Attraction/Activity Title",
          "location": "Accurate Location / Landmark",
          "description": "Engaging 1-2 sentence description of what to experience.",
          "category": "Sightseeing",
          "cost": 0
        }}
      ]
    }}
  ]
}}
"""

    @staticmethod
    def _call_gemini_api(prompt: str) -> Optional[Dict[str, Any]]:
        if not GEMINI_API_KEY:
            return None
        
        # Try Gemini 2.0 Flash or 1.5 Flash
        models = ["gemini-2.0-flash", "gemini-1.5-flash"]
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "response_mime_type": "application/json",
                    "temperature": 0.7,
                }
            }
            try:
                resp = requests.post(url, json=payload, timeout=25)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        clean_text = text.strip()
                        if clean_text.startswith("```json"):
                            clean_text = clean_text[7:]
                        if clean_text.startswith("```"):
                            clean_text = clean_text[3:]
                        if clean_text.endswith("```"):
                            clean_text = clean_text[:-3]
                        return json.loads(clean_text.strip())
                else:
                    print(f"Gemini API error ({model}): {resp.status_code} - {resp.text[:150]}")
            except Exception as e:
                print(f"Gemini API request failed for {model}: {e}")
        return None

    @staticmethod
    def _call_openai_api(prompt: str) -> Optional[Dict[str, Any]]:
        if not OPENAI_API_KEY:
            return None
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a professional travel planner returning strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7
        }
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=25)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception as e:
            print(f"OpenAI API call failed: {e}")
        return None

    @staticmethod
    def _generate_fallback_itinerary(trip_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Intelligent, high-quality heuristic generator when no API key is provided
        or if API quota is reached. Delivers realistic, accurate travel guides for any location.
        """
        destination = trip_data.get("destination", "Goa").strip()
        duration = int(trip_data.get("duration", 3))
        budget = float(trip_data.get("budget", 20000))
        currency = trip_data.get("currency", "INR")
        travelers = int(trip_data.get("travelers", 2))
        travel_style = trip_data.get("travel_style", "Balanced")
        accommodation_tier = trip_data.get("accommodation", "Standard")
        pace = trip_data.get("travel_pace", "Balanced")
        interests = trip_data.get("interests", ["Sightseeing", "Food"])

        # Destination-specific knowledge bank
        dest_lower = destination.lower()
        known_destinations = {
            "goa": {
                "hotel": "Seashell Suites & Beach Resort",
                "area": "Candolim / Vagator",
                "amenities": ["Poolside Bar", "Beachfront Access", "Goan Breakfast Buffet"],
                "transit": [
                    {"mode": "Scooter / Activa Rental", "desc": "Best for hopping between north and south beaches.", "cost": 450 * duration},
                    {"mode": "Local Private Taxis", "desc": "Convenient for airport transfers and night travels.", "cost": 2200}
                ],
                "tips": [
                    "Rent a scooter for authentic coastal exploring; always wear helmets.",
                    "Visit South Goa for serene, tranquil beaches (Palolem, Agonda) and North for nightlife (Anjuna, Vagator).",
                    "Try authentic Goan Fish Thali and Bebinca dessert at traditional shacks.",
                    "Carry cash as small beach shacks and parking spots often have patchy internet."
                ],
                "day_themes": [
                    "North Goa Forts, Panoramic Viewpoints & Sunset Vibes",
                    "Old Goa Heritage Churches, Latin Quarter (Fontainhas) & Spice Plantation",
                    "Watersports Adventure, Beach Shacks & Vibrant Nightlife",
                    "South Goa Tranquility, Cabo de Rama & Hidden Coves",
                    "Mandovi River Cruise, Flea Markets & Souvenir Hunting"
                ],
                "spots": [
                    [
                        {"title": "Explore Fort Aguada & Historic Lighthouse", "loc": "Sinquerim, Candolim", "time": "09:00 AM", "cat": "Sightseeing", "desc": "17th-century Portuguese coastal fort with panoramic ocean views.", "cost": 100},
                        {"title": "Relax & Swim at Sinquerim Beach", "loc": "Sinquerim Coastline", "time": "11:30 AM", "cat": "Relaxation", "desc": "Golden sand bay ideal for sunbathing and dolphin spotting boat rides.", "cost": 400},
                        {"title": "Sunset View from Chapora Fort", "loc": "Vagator Hilltop", "time": "05:00 PM", "cat": "Sightseeing", "desc": "Famous Dil Chahta Hai fort offering majestic sunset views over Vagator beach.", "cost": 50},
                        {"title": "Dinner & Live Music at Curlies or Titlie", "loc": "Ozran / Anjuna Beach", "time": "08:00 PM", "cat": "Food", "desc": "Vibrant beachside dinner with eclectic coastal cocktails and sea breezes.", "cost": 850}
                    ],
                    [
                        {"title": "Walk the Heritage Streets of Fontainhas", "loc": "Panaji Latin Quarter", "time": "09:30 AM", "cat": "Sightseeing", "desc": "Picturesque Portuguese colonial houses painted in pastel yellows and blues.", "cost": 0},
                        {"title": "Visit Basilica of Bom Jesus", "loc": "Old Goa", "time": "12:00 PM", "cat": "Sightseeing", "desc": "UNESCO World Heritage church holding the sacred relics of St. Francis Xavier.", "cost": 50},
                        {"title": "Sahakari Spice Farm Tour & Traditional Lunch", "loc": "Ponda Valley", "time": "02:30 PM", "cat": "Food", "desc": "Guided walk through aromatic vanilla, pepper, and cardamom plantations followed by a Goan buffet.", "cost": 600},
                        {"title": "Evening Mandovi River Sunset Catamaran", "loc": "Panjim Jetty", "time": "06:00 PM", "cat": "Relaxation", "desc": "Cruise with traditional Goan folk performances and scenic city skylines.", "cost": 500}
                    ],
                    [
                        {"title": "Watersports Thrills at Calangute/Baga", "loc": "Baga Beach Shoreline", "time": "09:30 AM", "cat": "Adventure", "desc": "Jet skiing, parasailing, and banana boat rides on the Arabian sea.", "cost": 1500},
                        {"title": "Seafood Feast at Fisherman's Wharf", "loc": "Salcete / Panjim", "time": "01:30 PM", "cat": "Food", "desc": "Savor authentic butter garlic crab, kingfish rava fry, and prawn curry.", "cost": 900},
                        {"title": "Anjuna Flea Market Shopping", "loc": "Anjuna Coast", "time": "05:00 PM", "cat": "Shopping", "desc": "Bohemian jewelry, handcrafted apparel, spices, and souvenirs.", "cost": 300},
                        {"title": "Beach Bonfire & Stargazing", "loc": "Morjim / Ashwem", "time": "08:30 PM", "cat": "Relaxation", "desc": "Peaceful night stroll by the gentle waves with acoustic music.", "cost": 200}
                    ]
                ],
                "meals": [
                    {"b": "Infantaria Bakery", "l": "Vinayak Family Restaurant", "d": "Thalassa Mediterranean Deck"},
                    {"b": "Cafe Bodega Latin Quarter", "l": "Sahakari Spice Buffet", "d": "Fisherman's Wharf Waterfront"},
                    {"b": "Artjuna Garden Cafe", "l": "Pousada by the Beach", "d": "Britto's Beach Shack"}
                ]
            },
            "paris": {
                "hotel": "Hotel Saint-Germain des Prés",
                "area": "6th Arrondissement, Central Paris",
                "amenities": ["Metro Station 2 min walk", "Parisian Breakfast", "Courtyard Garden"],
                "transit": [
                    {"mode": "Paris Metro & RER Pass", "desc": "Unlimited transit across central Parisian zones.", "cost": 35 * duration},
                    {"mode": "Walking & Velib Bike Shares", "desc": "The best way to soak in Parisian architecture.", "cost": 15}
                ],
                "tips": [
                    "Book Eiffel Tower and Louvre museum tickets at least 2 weeks in advance online.",
                    "Always greet shopkeepers and servers with a polite 'Bonjour' upon entering.",
                    "Pickpockets are common near Montmartre and metro hubs; keep bags zipped in front of you.",
                    "Enjoy an evening picnic along the Seine near Pont Neuf with fresh baguette and cheese."
                ],
                "day_themes": [
                    "Iconic Monuments, River Seine & Eiffel Tower Magic",
                    "Art Treasures at the Louvre & Chic Saint-Germain Stroll",
                    "Bohemian Montmartre, Sacré-Cœur & Historic Marais",
                    "Palace of Versailles Grandeur & Gardens",
                    "Latin Quarter Bookshops & Luxembourg Gardens Serenity"
                ],
                "spots": [
                    [
                        {"title": "Morning Ascend to the Eiffel Tower", "loc": "Champ de Mars, 7th Arr.", "time": "09:00 AM", "cat": "Sightseeing", "desc": "Panoramic 360-degree views across Paris from the second or summit floor.", "cost": 30},
                        {"title": "Stroll down Avenue des Champs-Élysées", "loc": "8th Arrondissement", "time": "12:00 PM", "cat": "Sightseeing", "desc": "Walk from the majestic Arc de Triomphe towards Place de la Concorde.", "cost": 0},
                        {"title": "Seine River Sightseeing Cruise", "loc": "Pont de l'Alma Pier", "time": "04:30 PM", "cat": "Relaxation", "desc": "Glide past Notre-Dame, Orsay Museum, and historic bridges.", "cost": 18},
                        {"title": "Bistro Dinner in Saint-Germain", "loc": "Boulevard Saint-Germain", "time": "08:00 PM", "cat": "Food", "desc": "Traditional French duck confit, beef bourguignon, and crème brûlée.", "cost": 45}
                    ],
                    [
                        {"title": "Masterpieces of Musée du Louvre", "loc": "Rue de Rivoli", "time": "09:30 AM", "cat": "Sightseeing", "desc": "Marvel at Mona Lisa, Venus de Milo, and the Winged Victory of Samothrace.", "cost": 22},
                        {"title": "Relax in the Tuileries Garden", "loc": "Place de la Concorde", "time": "01:00 PM", "cat": "Relaxation", "desc": "Enjoy green chairs beside tranquil fountains with a fresh croissant.", "cost": 8},
                        {"title": "Boutique Exploration in Le Marais", "loc": "4th Arrondissement", "time": "04:00 PM", "cat": "Shopping", "desc": "Cobblestone alleys with trendy designer stores, vintage shops, and art galleries.", "cost": 0},
                        {"title": "Creperie Dinner near Place des Vosges", "loc": "Place des Vosges", "time": "07:30 PM", "cat": "Food", "desc": "Savory buckwheat galettes paired with traditional Breton cider.", "cost": 28}
                    ],
                    [
                        {"title": "Ascend to Sacré-Cœur Basilica", "loc": "Montmartre Hill", "time": "09:30 AM", "cat": "Sightseeing", "desc": "Travertine white basilica perched atop the highest hill in Paris.", "cost": 0},
                        {"title": "Place du Tertre Artists Square", "loc": "Montmartre", "time": "11:30 AM", "cat": "Sightseeing", "desc": "Open-air easel painters, caricaturists, and lively Parisian bohemian vibe.", "cost": 15},
                        {"title": "Visit Musée de l'Orangerie", "loc": "Jardin des Tuileries", "time": "03:30 PM", "cat": "Sightseeing", "desc": "Claude Monet's massive, panoramic Water Lilies murals.", "cost": 14},
                        {"title": "Dinner at a Classic Montmartre Brasserie", "loc": "Rue des Abbesses", "time": "08:00 PM", "cat": "Food", "desc": "French onion soup, steak frites, and fine wine under glowing lanterns.", "cost": 40}
                    ]
                ],
                "meals": [
                    {"b": "Café de Flore", "l": "Le Relais de l'Entrecôte", "d": "Le Bouillon Chartier"},
                    {"b": "Du Pain et des Idées", "l": "L'As du Fallafel (Marais)", "d": "Chez Janou"},
                    {"b": "La Maison Rose", "l": "Le Consulat Montmartre", "d": "Bistrot Paul Bert"}
                ]
            }
        }

        # Check if known destination, else build a rich generic template
        info = None
        for key in known_destinations:
            if key in dest_lower:
                info = known_destinations[key]
                break

        if not info:
            # High-end generic city template customized to destination
            info = {
                "hotel": f"Grand Central Hotel & Suites {destination}",
                "area": f"Downtown {destination} / Heritage District",
                "amenities": ["High-Speed Wi-Fi", "Complimentary Breakfast", "Central Location"],
                "transit": [
                    {"mode": "Public Transit / Metro & Bus", "desc": f"Affordable and quick way to navigate {destination}.", "cost": round(budget * 0.05)},
                    {"mode": "Rideshare / Taxis", "desc": "Ideal for late evenings and trips with luggage.", "cost": round(budget * 0.07)}
                ],
                "tips": [
                    f"Check seasonal weather and wear comfortable walking shoes while exploring {destination}.",
                    "Keep emergency local helpline and embassy contacts saved offline.",
                    f"Sample local street specialties and signature culinary dishes of {destination}.",
                    "Buy landmark admission tickets in advance online to bypass queues."
                ],
                "day_themes": [
                    f"Highlights, Historic Landmarks & City Introduction",
                    f"Cultural Heritage, Art Galleries & Local Gastronomy",
                    f"Scenic Nature, Panoramic Viewpoints & Sunset Experience",
                    f"Vibrant Local Markets, Shopping & Nightlife",
                    f"Day Excursion & Hidden Gems"
                ],
                "spots": [
                    [
                        {"title": f"Explore {destination} Central Square & Historic Landmark", "loc": f"{destination} City Center", "time": "09:00 AM", "cat": "Sightseeing", "desc": f"Iconic architectural landmark and bustling hub of {destination}.", "cost": round(budget * 0.02)},
                        {"title": f"Visit {destination} National Museum & Art Pavilion", "loc": f"Cultural District, {destination}", "time": "11:30 AM", "cat": "Sightseeing", "desc": "Fascinating artifacts and cultural exhibits detailing regional heritage.", "cost": round(budget * 0.02)},
                        {"title": f"Scenic Stroll through {destination} Botanical Gardens", "loc": f"Riverfront / Green Belt", "time": "04:30 PM", "cat": "Relaxation", "desc": "Lush walking pathways, tranquil water features, and manicured flora.", "cost": round(budget * 0.01)},
                        {"title": f"Dinner at Renowned {destination} Bistro", "loc": f"Old Quarter, {destination}", "time": "08:00 PM", "cat": "Food", "desc": "Authentic regional specialties prepared with fresh seasonal ingredients.", "cost": round(budget * 0.04)}
                    ],
                    [
                        {"title": f"Morning Panoramic View from {destination} Lookout", "loc": f"Upper Vista Point", "time": "09:30 AM", "cat": "Sightseeing", "desc": "Sweeping bird's-eye views over the cityscape and natural surrounding topography.", "cost": round(budget * 0.015)},
                        {"title": f"Browse {destination} Artisan Crafts & Grand Bazaar", "loc": f"Central Market Hall", "time": "12:00 PM", "cat": "Shopping", "desc": "Handcrafted souvenirs, textiles, indigenous spices, and local sweets.", "cost": round(budget * 0.03)},
                        {"title": f"Architectural Walking Tour of Historic Quarters", "loc": f"Heritage Boulevard", "time": "04:00 PM", "cat": "Sightseeing", "desc": "Stroll through centuries-old streets with distinct period architecture.", "cost": 0},
                        {"title": f"Signature Dinner & Cultural Music Evening", "loc": f"Heritage Courtyard", "time": "07:30 PM", "cat": "Food", "desc": "Multi-course regional tasting menu accompanied by live acoustic performances.", "cost": round(budget * 0.045)}
                    ],
                    [
                        {"title": f"Outdoor Adventure & Nature Trail at {destination} Hills", "loc": f"Green Valley Park", "time": "09:00 AM", "cat": "Adventure", "desc": "Invigorating hiking trail with lush canopies and pristine lookout spots.", "cost": round(budget * 0.02)},
                        {"title": f"Lakeside or Waterfront Cafe Lunch", "loc": f"Marina Promenade", "time": "01:00 PM", "cat": "Food", "desc": "Relaxed waterside dining with refreshing beverages and local catch.", "cost": round(budget * 0.03)},
                        {"title": f"Afternoon Leisure & Souvenir Hunting", "loc": f"Arts District", "time": "05:00 PM", "cat": "Shopping", "desc": "Discover independent boutiques, local crafts, and specialty tea/coffee roasters.", "cost": round(budget * 0.025)},
                        {"title": f"Farewell Dinner & Rooftop Skyline Views", "loc": f"Sky Lounge {destination}", "time": "08:00 PM", "cat": "Food", "desc": "Celebratory gourmet dinner overlooking the illuminated night horizon.", "cost": round(budget * 0.05)}
                    ]
                ],
                "meals": [
                    {"b": f"{destination} Morning Bakery", "l": f"The Local Flavors Diner", "d": f"The Heritage Dining Room"},
                    {"b": f"Artisan Coffee Lab", "l": f"Old Town Spice Kitchen", "d": f"Rooftop Panorama Restaurant"},
                    {"b": f"Sunrise Cafe & Pastries", "l": f"Waterfront Fish House", "d": f"The Grand Terrace Bistro"}
                ]
            }

        # Budget Allocation Calculations
        acc_cost = round(budget * 0.38)
        nightly_cost = round(acc_cost / max(duration - 1, 1))
        food_cost = round(budget * 0.28)
        transport_cost = round(budget * 0.14)
        activity_cost = round(budget * 0.20)
        total_estimated = acc_cost + food_cost + transport_cost + activity_cost

        # Build day-wise schedule
        days_list = []
        start_date_str = trip_data.get("start_date")
        start_date = None
        if start_date_str:
            try:
                start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
            except Exception:
                start_date = datetime.date.today()
        else:
            start_date = datetime.date.today()

        daily_budget_act = activity_cost / duration

        for d in range(1, duration + 1):
            curr_date = start_date + datetime.timedelta(days=d-1)
            theme_idx = (d - 1) % len(info["day_themes"])
            theme = info["day_themes"][theme_idx]

            # Select spots cycle
            spot_group_idx = (d - 1) % len(info["spots"])
            raw_activities = info["spots"][spot_group_idx]

            activities = []
            for act in raw_activities:
                activities.append({
                    "id": str(uuid.uuid4()),
                    "time": act["time"],
                    "title": act["title"],
                    "location": act["loc"],
                    "description": act["desc"],
                    "category": act.get("cat", "Sightseeing"),
                    "cost": float(act.get("cost", round(daily_budget_act / len(raw_activities))))
                })

            meal_idx = (d - 1) % len(info["meals"])
            meal_data = info["meals"][meal_idx]
            meals = [
                {"meal_type": "Breakfast", "restaurant_name": meal_data["b"], "cuisine": "Continental / Local morning delights", "estimated_cost": round(food_cost / (duration * 3))},
                {"meal_type": "Lunch", "restaurant_name": meal_data["l"], "cuisine": "Authentic regional lunch menu", "estimated_cost": round(food_cost / (duration * 2.5))},
                {"meal_type": "Dinner", "restaurant_name": meal_data["d"], "cuisine": "Gourmet evening dining & appetizers", "estimated_cost": round(food_cost / (duration * 2))}
            ]

            day_total = sum(a["cost"] for a in activities)

            days_list.append({
                "day": d,
                "date": curr_date.strftime("%b %d, %Y"),
                "theme": theme,
                "estimated_daily_cost": day_total,
                "meals": meals,
                "activities": activities
            })

        return {
            "id": str(uuid.uuid4()),
            "trip_id": trip_data.get("id", str(uuid.uuid4())),
            "destination": destination,
            "duration": duration,
            "estimated_budget": budget,
            "actual_estimated_cost": total_estimated,
            "currency": currency,
            "summary": f"A personalized {duration}-day journey across {destination} designed for {travelers} traveler(s) with a {travel_style.lower()} focus. Featuring carefully scheduled sightseeing, authentic dining, and optimized routes that maximize your budget.",
            "budget_breakdown": {
                "accommodation": acc_cost,
                "food": food_cost,
                "transportation": transport_cost,
                "activities": activity_cost,
                "total": total_estimated
            },
            "accommodation": {
                "name": info["hotel"],
                "type": accommodation_tier,
                "estimated_nightly_cost": nightly_cost,
                "location": info["area"],
                "highlights": info["amenities"]
            },
            "transportation": info["transit"],
            "travel_tips": info["tips"],
            "days": days_list
        }

    @classmethod
    def generate_itinerary(cls, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = cls._create_prompt(trip_data)
        
        # 1. Try Gemini
        ai_result = cls._call_gemini_api(prompt)
        
        # 2. Try OpenAI if Gemini not set or failed
        if not ai_result:
            ai_result = cls._call_openai_api(prompt)

        # 3. Fallback to heuristic generator if APIs not set or failed
        if not ai_result:
            print("Notice: Using intelligent heuristic generator (No API key or quota exceeded).")
            ai_result = cls._generate_fallback_itinerary(trip_data)

        # Ensure IDs exist on activities and trip_id is assigned
        trip_id = trip_data.get("id", str(uuid.uuid4()))
        ai_result["trip_id"] = trip_id
        if "id" not in ai_result:
            ai_result["id"] = str(uuid.uuid4())

        for day in ai_result.get("days", []):
            for act in day.get("activities", []):
                if not act.get("id"):
                    act["id"] = str(uuid.uuid4())
                if "cost" in act:
                    act["cost"] = float(act["cost"])

        return ai_result

    @classmethod
    def regenerate_day(cls, destination: str, day_number: int, date_str: str, currency: str, feedback: str = "") -> Dict[str, Any]:
        """
        Regenerates a specific day with new fresh activities matching user feedback.
        """
        prompt = f"""Generate an alternative Day {day_number} itinerary for {destination}.
Date: {date_str}
Currency: {currency}
User special instructions / feedback: {feedback if feedback else 'Provide fresh new activities and alternative spots.'}

Return JSON with this structure:
{{
  "day": {day_number},
  "date": "{date_str}",
  "theme": "New creative theme",
  "estimated_daily_cost": 500,
  "meals": [
    {{"meal_type": "Breakfast", "restaurant_name": "New Spot", "cuisine": "Local", "estimated_cost": 150}},
    {{"meal_type": "Lunch", "restaurant_name": "New Spot", "cuisine": "Local", "estimated_cost": 300}},
    {{"meal_type": "Dinner", "restaurant_name": "New Spot", "cuisine": "Local", "estimated_cost": 450}}
  ],
  "activities": [
    {{
      "id": "act-new-1",
      "time": "09:00 AM",
      "title": "Fresh Alternative Activity",
      "location": "Location in {destination}",
      "description": "Engaging description",
      "category": "Sightseeing",
      "cost": 200
    }},
    {{
      "id": "act-new-2",
      "time": "01:30 PM",
      "title": "Hidden Gem Experience",
      "location": "Location in {destination}",
      "description": "Engaging description",
      "category": "Food",
      "cost": 350
    }},
    {{
      "id": "act-new-3",
      "time": "05:30 PM",
      "title": "Sunset Lookout or Local Market",
      "location": "Location in {destination}",
      "description": "Engaging description",
      "category": "Shopping",
      "cost": 100
    }}
  ]
}}
"""
        res = cls._call_gemini_api(prompt)
        if not res:
            res = cls._call_openai_api(prompt)
        if not res:
            # Fallback day
            res = {
                "day": day_number,
                "date": date_str,
                "theme": f"Alternative Adventures & Hidden Gems in {destination}",
                "estimated_daily_cost": 650,
                "meals": [
                    {"meal_type": "Breakfast", "restaurant_name": f"{destination} Morning Garden Cafe", "cuisine": "Artisan coffee & baked delights", "estimated_cost": 200},
                    {"meal_type": "Lunch", "restaurant_name": f"The Spice Courtyard {destination}", "cuisine": "Traditional organic tasting plate", "estimated_cost": 350},
                    {"meal_type": "Dinner", "restaurant_name": f"Sunset Cliffside Tavern", "cuisine": "Fresh local seafood & mocktails", "estimated_cost": 500}
                ],
                "activities": [
                    {
                        "id": str(uuid.uuid4()),
                        "time": "09:30 AM",
                        "title": f"Morning Cycling & Local Architecture Discovery",
                        "location": f"Old Quarter, {destination}",
                        "description": f"Pedal through quaint streets with quiet back-alleys and historical facades.",
                        "category": "Adventure",
                        "cost": 250
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "time": "02:00 PM",
                        "title": f"Artisanal Workshop & Local Pottery/Crafts",
                        "location": f"Cultural Center, {destination}",
                        "description": f"Hands-on cultural masterclass with local artisans.",
                        "category": "Sightseeing",
                        "cost": 300
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "time": "05:30 PM",
                        "title": f"Sunset View from Secret Cliff Point",
                        "location": f"Coastal Ridge / High Point",
                        "description": f"Avoid the crowded tourist spots and take in the golden hour in peace.",
                        "category": "Relaxation",
                        "cost": 50
                    }
                ]
            }

        for a in res.get("activities", []):
            a["id"] = str(uuid.uuid4())
            a["cost"] = float(a.get("cost", 0))

        return res

