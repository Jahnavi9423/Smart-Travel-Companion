export type TravelerType = 'solo' | 'couple' | 'family' | 'group';

export type TripStatus = 'planning' | 'active' | 'completed';

export interface PlanItem {
    name: string;
    description: string;
    estimatedCost: number;
    category: string;
}

export interface GeneratedPlan {
    transport: PlanItem[];
    accommodation: PlanItem[];
    food: PlanItem[];
    sightseeing: PlanItem[];
    localTravel: PlanItem[];
    destinationOverview?: string;
    totalEstimated: number;
    itinerary: ItineraryDay[];
}

export interface ItineraryItem {
    id: string;
    time: string;
    title: string;
    description: string;
}

export interface ItineraryDay {
    date: string;
    items: ItineraryItem[];
}

export interface Expense {
    id: string;
    tripId: string;
    amount: number;
    category: string;
    description: string;
    date: string;
}

export interface TripNote {
    id: string;
    tripId: string;
    content: string;
    createdAt: string;
}

export interface Trip {
    id: string;
    title: string;
    destination: string;
    country: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    budget: number;
    currency: string;
    travelerType: TravelerType;
    travelerCount: number;
    status: TripStatus;
    expenses: Expense[];
    itinerary: ItineraryDay[];
    notes: TripNote[];
    createdAt: string;
}
