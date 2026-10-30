import json
import os
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
from config import SUPABASE_URL, SUPABASE_KEY

# Local storage path as fallback or cache
DATA_DIR = Path(__file__).resolve().parent / "data"
STORAGE_FILE = DATA_DIR / "storage.json"

# In-memory / JSON file manager
def _init_local_storage():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STORAGE_FILE.exists():
        default_data = {
            "trips": [],
            "itineraries": {},
            "profiles": [
                {
                    "id": "user-demo-123",
                    "email": "traveler@example.com",
                    "name": "Alex Traveler",
                    "preferred_currency": "INR",
                    "preferred_style": "Balanced"
                }
            ]
        }
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(default_data, f, indent=2)

def _read_local_storage() -> Dict[str, Any]:
    _init_local_storage()
    try:
        with open(STORAGE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"trips": [], "itineraries": {}, "profiles": []}

def _write_local_storage(data: Dict[str, Any]):
    _init_local_storage()
    with open(STORAGE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Supabase Client setup (if configured)
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase successfully!")
    except Exception as e:
        print(f"Notice: Supabase init error ({e}). Using local storage engine.")
        supabase = None
else:
    print("Supabase credentials not set. Running with high-performance local storage engine.")

# Database operations
class DatabaseService:
    @staticmethod
    def get_trips() -> List[Dict[str, Any]]:
        if supabase:
            try:
                res = supabase.table("trips").select("*").order("created_at", desc=True).execute()
                return res.data or []
            except Exception as e:
                print(f"Supabase get_trips error: {e}. Falling back to local storage.")
        data = _read_local_storage()
        return data.get("trips", [])

    @staticmethod
    def get_trip(trip_id: str) -> Optional[Dict[str, Any]]:
        if supabase:
            try:
                res = supabase.table("trips").select("*").eq("id", trip_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase get_trip error: {e}")
        data = _read_local_storage()
        for t in data.get("trips", []):
            if t.get("id") == trip_id:
                return t
        return None

    @staticmethod
    def save_trip(trip_dict: Dict[str, Any]) -> Dict[str, Any]:
        if "created_at" not in trip_dict:
            trip_dict["created_at"] = datetime.utcnow().isoformat()
        if "updated_at" not in trip_dict:
            trip_dict["updated_at"] = datetime.utcnow().isoformat()
        
        # Save to local storage
        data = _read_local_storage()
        trips = data.get("trips", [])
        
        # Replace if exists or append
        existing_idx = next((i for i, t in enumerate(trips) if t.get("id") == trip_dict.get("id")), -1)
        if existing_idx >= 0:
            trips[existing_idx] = trip_dict
        else:
            trips.insert(0, trip_dict)
        data["trips"] = trips
        _write_local_storage(data)

        # Sync to Supabase if available
        if supabase:
            try:
                supabase.table("trips").upsert(trip_dict).execute()
            except Exception as e:
                print(f"Supabase save_trip error: {e}")

        return trip_dict

    @staticmethod
    def update_trip(trip_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = _read_local_storage()
        trips = data.get("trips", [])
        updated_trip = None
        for t in trips:
            if t.get("id") == trip_id:
                t.update(updates)
                t["updated_at"] = datetime.utcnow().isoformat()
                updated_trip = t
                break
        if updated_trip:
            _write_local_storage(data)
            if supabase:
                try:
                    supabase.table("trips").update(updates).eq("id", trip_id).execute()
                except Exception as e:
                    print(f"Supabase update_trip error: {e}")
        return updated_trip

    @staticmethod
    def delete_trip(trip_id: str) -> bool:
        data = _read_local_storage()
        trips = data.get("trips", [])
        initial_len = len(trips)
        trips = [t for t in trips if t.get("id") != trip_id]
        data["trips"] = trips
        if trip_id in data.get("itineraries", {}):
            del data["itineraries"][trip_id]
        _write_local_storage(data)

        if supabase:
            try:
                supabase.table("trips").delete().eq("id", trip_id).execute()
                supabase.table("itineraries").delete().eq("trip_id", trip_id).execute()
            except Exception as e:
                print(f"Supabase delete_trip error: {e}")

        return len(trips) < initial_len

    @staticmethod
    def save_itinerary(itinerary_dict: Dict[str, Any]) -> Dict[str, Any]:
        trip_id = itinerary_dict.get("trip_id")
        itinerary_dict["updated_at"] = datetime.utcnow().isoformat()
        if "created_at" not in itinerary_dict:
            itinerary_dict["created_at"] = datetime.utcnow().isoformat()

        data = _read_local_storage()
        if "itineraries" not in data:
            data["itineraries"] = {}
        data["itineraries"][trip_id] = itinerary_dict
        _write_local_storage(data)

        # Sync to Supabase if available
        if supabase:
            try:
                supabase.table("itineraries").upsert({
                    "id": itinerary_dict.get("id"),
                    "trip_id": trip_id,
                    "total_cost": itinerary_dict.get("actual_estimated_cost", 0),
                    "summary": itinerary_dict.get("summary", ""),
                    "travel_tips": itinerary_dict.get("travel_tips", []),
                    "accommodation_recommendation": itinerary_dict.get("accommodation", {}),
                    "transportation_options": itinerary_dict.get("transportation", []),
                    "updated_at": itinerary_dict["updated_at"]
                }).execute()
            except Exception as e:
                print(f"Supabase save_itinerary error: {e}")

        return itinerary_dict

    @staticmethod
    def get_itinerary(trip_id: str) -> Optional[Dict[str, Any]]:
        data = _read_local_storage()
        itinerary = data.get("itineraries", {}).get(trip_id)
        if itinerary:
            return itinerary

        if supabase:
            try:
                res = supabase.table("itineraries").select("*").eq("trip_id", trip_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase get_itinerary error: {e}")
        return None

    @staticmethod
    def update_activity(trip_id: str, activity_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        itinerary = DatabaseService.get_itinerary(trip_id)
        if not itinerary:
            return None

        found = False
        target_activity = None
        for day in itinerary.get("days", []):
            for act in day.get("activities", []):
                if act.get("id") == activity_id:
                    act.update(updates)
                    target_activity = act
                    found = True
                    break
            if found:
                # Recalculate day cost
                day["estimated_daily_cost"] = sum(float(a.get("cost", 0)) for a in day.get("activities", []))
                break

        if found:
            # Recalculate total activity cost and total itinerary cost
            total_act_cost = sum(
                sum(float(a.get("cost", 0)) for a in day.get("activities", []))
                for day in itinerary.get("days", [])
            )
            itinerary["budget_breakdown"]["activities"] = total_act_cost
            itinerary["actual_estimated_cost"] = (
                float(itinerary["budget_breakdown"].get("accommodation", 0)) +
                float(itinerary["budget_breakdown"].get("food", 0)) +
                float(itinerary["budget_breakdown"].get("transportation", 0)) +
                total_act_cost
            )
            itinerary["budget_breakdown"]["total"] = itinerary["actual_estimated_cost"]
            DatabaseService.save_itinerary(itinerary)

        return target_activity

    @staticmethod
    def delete_activity(trip_id: str, activity_id: str) -> bool:
        itinerary = DatabaseService.get_itinerary(trip_id)
        if not itinerary:
            return False

        found = False
        for day in itinerary.get("days", []):
            original_len = len(day.get("activities", []))
            day["activities"] = [a for a in day.get("activities", []) if a.get("id") != activity_id]
            if len(day["activities"]) < original_len:
                found = True
                day["estimated_daily_cost"] = sum(float(a.get("cost", 0)) for a in day.get("activities", []))
                break

        if found:
            total_act_cost = sum(
                sum(float(a.get("cost", 0)) for a in day.get("activities", []))
                for day in itinerary.get("days", [])
            )
            itinerary["budget_breakdown"]["activities"] = total_act_cost
            itinerary["actual_estimated_cost"] = (
                float(itinerary["budget_breakdown"].get("accommodation", 0)) +
                float(itinerary["budget_breakdown"].get("food", 0)) +
                float(itinerary["budget_breakdown"].get("transportation", 0)) +
                total_act_cost
            )
            itinerary["budget_breakdown"]["total"] = itinerary["actual_estimated_cost"]
            DatabaseService.save_itinerary(itinerary)
            return True

        return False

    @staticmethod
    def add_activity(trip_id: str, day_number: int, activity_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        itinerary = DatabaseService.get_itinerary(trip_id)
        if not itinerary:
            return None

        for day in itinerary.get("days", []):
            if day.get("day") == day_number:
                day["activities"].append(activity_dict)
                day["estimated_daily_cost"] = sum(float(a.get("cost", 0)) for a in day.get("activities", []))
                break

        total_act_cost = sum(
            sum(float(a.get("cost", 0)) for a in day.get("activities", []))
            for day in itinerary.get("days", [])
        )
        itinerary["budget_breakdown"]["activities"] = total_act_cost
        itinerary["actual_estimated_cost"] = (
            float(itinerary["budget_breakdown"].get("accommodation", 0)) +
            float(itinerary["budget_breakdown"].get("food", 0)) +
            float(itinerary["budget_breakdown"].get("transportation", 0)) +
            total_act_cost
        )
        itinerary["budget_breakdown"]["total"] = itinerary["actual_estimated_cost"]
        DatabaseService.save_itinerary(itinerary)
        return activity_dict

    @staticmethod
    def update_itinerary_day(trip_id: str, day_number: int, new_day_plan: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        itinerary = DatabaseService.get_itinerary(trip_id)
        if not itinerary:
            return None

        found = False
        for i, day in enumerate(itinerary.get("days", [])):
            if day.get("day") == day_number:
                itinerary["days"][i] = new_day_plan
                found = True
                break

        if found:
            total_act_cost = sum(
                sum(float(a.get("cost", 0)) for a in day.get("activities", []))
                for day in itinerary.get("days", [])
            )
            itinerary["budget_breakdown"]["activities"] = total_act_cost
            itinerary["actual_estimated_cost"] = (
                float(itinerary["budget_breakdown"].get("accommodation", 0)) +
                float(itinerary["budget_breakdown"].get("food", 0)) +
                float(itinerary["budget_breakdown"].get("transportation", 0)) +
                total_act_cost
            )
            itinerary["budget_breakdown"]["total"] = itinerary["actual_estimated_cost"]
            DatabaseService.save_itinerary(itinerary)
            return new_day_plan
        return None

    @staticmethod
    def get_stats() -> Dict[str, Any]:
        trips = DatabaseService.get_trips()
        total_trips = len(trips)
        destinations = set(t.get("destination", "").strip().lower() for t in trips if t.get("destination"))
        total_budget = sum(float(t.get("budget", 0)) for t in trips)
        upcoming_count = sum(1 for t in trips if t.get("status") == "planned")

        return {
            "total_trips": total_trips,
            "unique_destinations": len(destinations),
            "total_budget": total_budget,
            "upcoming_trips": upcoming_count,
            "is_supabase_connected": bool(supabase is not None)
        }

