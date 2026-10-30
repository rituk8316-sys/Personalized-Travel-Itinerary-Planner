from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

class ActivityItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    time: str # e.g. "09:00 AM"
    title: str
    location: str
    description: Optional[str] = ""
    category: str = "Sightseeing" # Sightseeing, Food, Adventure, Shopping, Relaxation, Transport
    cost: float = 0.0

class MealRecommendation(BaseModel):
    meal_type: str # Breakfast, Lunch, Dinner
    restaurant_name: str
    cuisine: str
    estimated_cost: float

class DayPlan(BaseModel):
    day: int
    date: Optional[str] = None
    theme: str
    activities: List[ActivityItem] = []
    meals: List[MealRecommendation] = []
    estimated_daily_cost: float = 0.0

class BudgetBreakdown(BaseModel):
    accommodation: float = 0.0
    food: float = 0.0
    transportation: float = 0.0
    activities: float = 0.0
    total: float = 0.0

class AccommodationRecommendation(BaseModel):
    name: str
    type: str # Budget, Standard, Luxury
    estimated_nightly_cost: float = 0.0
    location: str
    highlights: List[str] = []

class TransportationOption(BaseModel):
    mode: str
    description: str
    estimated_cost: float = 0.0

class TripCreateRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: float
    currency: str = "INR"
    travelers: int = 1
    travel_style: str = "Balanced" # Budget, Luxury, Adventure, Relaxed, Cultural, Family
    travel_pace: str = "Balanced" # Relaxed, Balanced, Packed
    accommodation: str = "Standard" # Budget, Standard, Premium
    interests: List[str] = []
    special_notes: Optional[str] = ""

class TripUpdateRequest(BaseModel):
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    travelers: Optional[int] = None
    travel_style: Optional[str] = None
    travel_pace: Optional[str] = None
    status: Optional[str] = None

class ItineraryData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: str
    destination: str
    duration: int
    estimated_budget: float
    actual_estimated_cost: float
    currency: str = "INR"
    summary: str
    budget_breakdown: BudgetBreakdown
    accommodation: AccommodationRecommendation
    transportation: List[TransportationOption] = []
    travel_tips: List[str] = []
    days: List[DayPlan] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ActivityUpdateRequest(BaseModel):
    title: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    cost: Optional[float] = None

class ActivityCreateRequest(BaseModel):
    trip_id: str
    day_number: int
    time: str = "10:00 AM"
    title: str
    location: str
    description: Optional[str] = ""
    category: str = "Sightseeing"
    cost: float = 0.0

class RegenerateDayRequest(BaseModel):
    trip_id: str
    day_number: int
    feedback: Optional[str] = ""

class RegenerateTripRequest(BaseModel):
    trip_id: str
    feedback: Optional[str] = ""

