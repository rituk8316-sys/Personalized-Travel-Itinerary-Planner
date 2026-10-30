import uuid
import datetime
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any

from config import HOST, PORT, GEMINI_API_KEY, OPENAI_API_KEY, SUPABASE_URL
from models import (
    TripCreateRequest, TripUpdateRequest,
    ActivityUpdateRequest, ActivityCreateRequest,
    RegenerateDayRequest, RegenerateTripRequest
)
from database import DatabaseService
from ai_service import AIService

app = FastAPI(
    title="Personalized Travel Itinerary Planner API",
    description="AI-powered travel planning API using FastAPI, Generative AI, and Supabase",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to specific frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "Personalized Travel Itinerary Planner API",
        "status": "online",
        "version": "1.0.0",
        "endpoints": [
            "/api/trips",
            "/api/itinerary/generate",
            "/api/stats",
            "/docs"
        ]
    }

@app.get("/api/health")
def health_check():
    stats = DatabaseService.get_stats()
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "ai_provider": "Gemini" if GEMINI_API_KEY else ("OpenAI" if OPENAI_API_KEY else "Intelligent Fallback Engine"),
        "supabase_connected": stats["is_supabase_connected"]
    }

@app.get("/api/stats")
def get_stats():
    return DatabaseService.get_stats()

# ==========================================
# TRIPS CRUD ENDPOINTS (PRD Section 11)
# ==========================================

@app.post("/api/trips", status_code=201)
def create_trip(payload: TripCreateRequest):
    # Calculate duration in days
    try:
        s_date = datetime.datetime.strptime(payload.start_date, "%Y-%m-%d").date()
        e_date = datetime.datetime.strptime(payload.end_date, "%Y-%m-%d").date()
        duration = max((e_date - s_date).days + 1, 1)
    except Exception:
        duration = 3

    trip_id = str(uuid.uuid4())
    trip_dict = {
        "id": trip_id,
        "destination": payload.destination,
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "duration": duration,
        "budget": payload.budget,
        "currency": payload.currency,
        "travelers": payload.travelers,
        "travel_style": payload.travel_style,
        "travel_pace": payload.travel_pace,
        "accommodation": payload.accommodation,
        "interests": payload.interests,
        "special_notes": payload.special_notes,
        "status": "planned"
    }

    saved = DatabaseService.save_trip(trip_dict)
    return {"message": "Trip created successfully", "trip": saved}

@app.get("/api/trips")
def list_trips():
    return DatabaseService.get_trips()

@app.get("/api/trips/{trip_id}")
def get_trip(trip_id: str):
    trip = DatabaseService.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@app.put("/api/trips/{trip_id}")
def update_trip(trip_id: str, payload: TripUpdateRequest):
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    updated = DatabaseService.update_trip(trip_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip updated successfully", "trip": updated}

@app.delete("/api/trips/{trip_id}")
def delete_trip(trip_id: str):
    success = DatabaseService.delete_trip(trip_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found or already deleted")
    return {"message": "Trip deleted successfully"}

# ==========================================
# ITINERARY & AI GENERATION (PRD Section 11)
# ==========================================

@app.post("/api/itinerary/generate")
def generate_itinerary(payload: TripCreateRequest):
    # Calculate duration
    try:
        s_date = datetime.datetime.strptime(payload.start_date, "%Y-%m-%d").date()
        e_date = datetime.datetime.strptime(payload.end_date, "%Y-%m-%d").date()
        duration = max((e_date - s_date).days + 1, 1)
    except Exception:
        duration = 3

    trip_id = str(uuid.uuid4())
    trip_dict = {
        "id": trip_id,
        "destination": payload.destination,
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "duration": duration,
        "budget": payload.budget,
        "currency": payload.currency,
        "travelers": payload.travelers,
        "travel_style": payload.travel_style,
        "travel_pace": payload.travel_pace,
        "accommodation": payload.accommodation,
        "interests": payload.interests,
        "special_notes": payload.special_notes,
        "status": "planned"
    }

    # Save trip
    DatabaseService.save_trip(trip_dict)

    # Generate Itinerary with AI
    itinerary = AIService.generate_itinerary(trip_dict)
    
    # Save Itinerary
    DatabaseService.save_itinerary(itinerary)

    return {
        "message": "Itinerary generated successfully",
        "trip": trip_dict,
        "itinerary": itinerary
    }

@app.get("/api/itinerary/{trip_id}")
def get_itinerary(trip_id: str):
    itinerary = DatabaseService.get_itinerary(trip_id)
    if not itinerary:
        # Check if trip exists, generate if needed
        trip = DatabaseService.get_trip(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip and itinerary not found")
        # Auto-generate for this trip
        itinerary = AIService.generate_itinerary(trip)
        DatabaseService.save_itinerary(itinerary)
    return itinerary

@app.post("/api/itinerary/regenerate")
def regenerate_itinerary(payload: RegenerateTripRequest):
    trip = DatabaseService.get_trip(payload.trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if payload.feedback:
        trip["special_notes"] = f"{trip.get('special_notes', '')} - Feedback: {payload.feedback}"

    new_itinerary = AIService.generate_itinerary(trip)
    DatabaseService.save_itinerary(new_itinerary)
    return {"message": "Itinerary regenerated successfully", "itinerary": new_itinerary}

@app.post("/api/itinerary/regenerate-day")
def regenerate_day(payload: RegenerateDayRequest):
    trip = DatabaseService.get_trip(payload.trip_id)
    itinerary = DatabaseService.get_itinerary(payload.trip_id)
    if not trip or not itinerary:
        raise HTTPException(status_code=404, detail="Trip or itinerary not found")

    # Find the current day to get date
    date_str = f"Day {payload.day_number}"
    for d in itinerary.get("days", []):
        if d.get("day") == payload.day_number:
            date_str = d.get("date", date_str)
            break

    new_day = AIService.regenerate_day(
        destination=trip.get("destination", "Destination"),
        day_number=payload.day_number,
        date_str=date_str,
        currency=trip.get("currency", "INR"),
        feedback=payload.feedback
    )

    updated_day = DatabaseService.update_itinerary_day(payload.trip_id, payload.day_number, new_day)
    updated_itinerary = DatabaseService.get_itinerary(payload.trip_id)

    return {
        "message": f"Day {payload.day_number} regenerated successfully",
        "day": updated_day,
        "itinerary": updated_itinerary
    }

# ==========================================
# ACTIVITIES MANAGEMENT (PRD Section 11)
# ==========================================

@app.put("/api/activities/{activity_id}")
def update_activity(
    activity_id: str,
    payload: ActivityUpdateRequest,
    trip_id: str = Query(..., description="The ID of the trip containing this activity")
):
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    updated = DatabaseService.update_activity(trip_id, activity_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Activity or trip not found")
    return {"message": "Activity updated successfully", "activity": updated}

@app.delete("/api/activities/{activity_id}")
def delete_activity(
    activity_id: str,
    trip_id: str = Query(..., description="The ID of the trip containing this activity")
):
    success = DatabaseService.delete_activity(trip_id, activity_id)
    if not success:
        raise HTTPException(status_code=404, detail="Activity not found or already deleted")
    return {"message": "Activity deleted successfully"}

@app.post("/api/activities")
def add_activity(payload: ActivityCreateRequest):
    new_act = {
        "id": str(uuid.uuid4()),
        "time": payload.time,
        "title": payload.title,
        "location": payload.location,
        "description": payload.description,
        "category": payload.category,
        "cost": float(payload.cost)
    }
    added = DatabaseService.add_activity(payload.trip_id, payload.day_number, new_act)
    if not added:
        raise HTTPException(status_code=404, detail="Trip or day not found")
    return {"message": "Activity added successfully", "activity": added}

# Legacy endpoint fallback so old tests work seamlessly
@app.post("/generate-itinerary")
def legacy_generate(body: Dict[str, Any] = Body(...)):
    dest = body.get("destination", "Goa")
    days = int(body.get("days", 3))
    budget_tier = body.get("budget", "Budget")
    budget_val = 15000 if budget_tier == "Budget" else (35000 if budget_tier == "Mid-Range" else 80000)
    trip_data = {
        "id": str(uuid.uuid4()),
        "destination": dest,
        "duration": days,
        "budget": budget_val,
        "currency": "INR",
        "travelers": 2,
        "travel_style": body.get("travel_style", "Adventure"),
        "travel_pace": "Balanced",
        "accommodation": "Standard",
        "interests": ["Sightseeing", "Food", "Adventure"]
    }
    itinerary = AIService.generate_itinerary(trip_data)
    # Return formatted text representation for simple callers
    summary = f"✈️ {dest.upper()} {days}-DAY ITINERARY\nBudget: ₹{budget_val:,}\n\n"
    for d in itinerary.get("days", []):
        summary += f"--- Day {d['day']}: {d['theme']} ---\n"
        for a in d.get("activities", []):
            summary += f"• {a['time']} - {a['title']} ({a['location']}) - ₹{a['cost']}\n  {a['description']}\n"
        summary += "\n"
    return {"itinerary": summary, "data": itinerary}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

