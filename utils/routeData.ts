// ─── Route Database ───────────────────────────────────────────────────────────
// Each route entry has four transport-mode keys: bus, train, flight, car.
// Each mode holds an array of route options with:
//   name       – display name for the service / route
//   departure  – departure location label
//   arrival    – arrival location label
//   duration   – human-readable travel time
//   costPerPerson – one-way fare in INR per person

export type RouteOption = {
  name: string;
  departure: string;
  arrival: string;
  duration: string;
  costPerPerson: number;
};

export type RouteEntry = {
  bus: RouteOption[];
  train: RouteOption[];
  flight: RouteOption[];
  car: RouteOption[];
};

export const ROUTE_DB: Record<string, Record<string, RouteEntry>> = {
  // ── Vizianagaram ──────────────────────────────────────────────────────────
  vizianagaram: {
    visakhapatnam: {
      bus: [
        {
          name: "APSRTC Express",
          departure: "Vizianagaram Bus Stand",
          arrival: "Visakhapatnam Bus Stand",
          duration: "1 hr 30 min",
          costPerPerson: 65,
        },
        {
          name: "VZM → Vizag Direct (Sleeper)",
          departure: "Vizianagaram Bus Stand",
          arrival: "Dwaraka Nagar, Visakhapatnam",
          duration: "1 hr 45 min",
          costPerPerson: 90,
        },
      ],
      train: [
        {
          name: "Intercity Express",
          departure: "Vizianagaram Railway Station",
          arrival: "Visakhapatnam Railway Station",
          duration: "1 hr 10 min",
          costPerPerson: 45,
        },
        {
          name: "Passenger Train",
          departure: "Vizianagaram Railway Station",
          arrival: "Visakhapatnam Railway Station",
          duration: "1 hr 45 min",
          costPerPerson: 30,
        },
      ],
      flight: [], // distance too short — no flights
      car: [
        {
          name: "Private Cab / Self-Drive",
          departure: "Vizianagaram",
          arrival: "Visakhapatnam",
          duration: "1 hr 15 min",
          costPerPerson: 1200, // total cab fare (~₹1200 for whole car)
        },
        {
          name: "Shared Taxi",
          departure: "Vizianagaram",
          arrival: "Visakhapatnam",
          duration: "1 hr 20 min",
          costPerPerson: 300,
        },
      ],
    },

    araku: {
      bus: [
        {
          name: "VZM → Araku via S.Kota",
          departure: "Vizianagaram Bus Stand",
          arrival: "Araku Valley Bus Stand",
          duration: "4 hr 30 min",
          costPerPerson: 120,
        },
        {
          name: "VZM → Araku Direct (APSRTC)",
          departure: "Vizianagaram Bus Stand",
          arrival: "Araku Valley Bus Stand",
          duration: "4 hr",
          costPerPerson: 85,
        },
      ],
      train: [], // No direct train from VZM to Araku
      flight: [], // No flights
      car: [
        {
          name: "Private Cab to Araku",
          departure: "Vizianagaram",
          arrival: "Araku Valley",
          duration: "3 hr 30 min",
          costPerPerson: 2500, // total cab cost
        },
      ],
    },

    hyderabad: {
      bus: [
        {
          name: "VZM → Hyderabad (Sleeper AC)",
          departure: "Vizianagaram Bus Stand",
          arrival: "Hyderabad MGBS",
          duration: "11 hr",
          costPerPerson: 1200,
        },
        {
          name: "VZM → Hyderabad (Non-AC)",
          departure: "Vizianagaram Bus Stand",
          arrival: "Hyderabad MGBS",
          duration: "12 hr",
          costPerPerson: 900,
        },
      ],
      train: [
        {
          name: "Godavari Express",
          departure: "Vizianagaram Railway Station",
          arrival: "Hyderabad Secunderabad",
          duration: "12 hr",
          costPerPerson: 550,
        },
        {
          name: "East Coast Express",
          departure: "Vizianagaram Railway Station",
          arrival: "Hyderabad Kacheguda",
          duration: "11 hr 30 min",
          costPerPerson: 480,
        },
      ],
      flight: [
        {
          name: "IndiGo VTZ → HYD",
          departure: "Visakhapatnam Airport (VTZ)",
          arrival: "Hyderabad Rajiv Gandhi Airport (HYD)",
          duration: "1 hr 10 min",
          costPerPerson: 3500,
        },
        {
          name: "Air India VTZ → HYD",
          departure: "Visakhapatnam Airport (VTZ)",
          arrival: "Hyderabad Rajiv Gandhi Airport (HYD)",
          duration: "1 hr 15 min",
          costPerPerson: 4200,
        },
      ],
      car: [
        {
          name: "Private Cab (NH-16)",
          departure: "Vizianagaram",
          arrival: "Hyderabad",
          duration: "9 hr",
          costPerPerson: 8000, // full car estimate
        },
      ],
    },
  },

  // ── Visakhapatnam ─────────────────────────────────────────────────────────
  visakhapatnam: {
    araku: {
      bus: [
        {
          name: "Vizag → S.Kota → Araku",
          departure: "Visakhapatnam Bus Stand",
          arrival: "Araku Valley Bus Stand",
          duration: "3 hr 30 min",
          costPerPerson: 135,
        },
        {
          name: "Vizag → Vizianagaram → Araku",
          departure: "Visakhapatnam Bus Stand",
          arrival: "Araku Valley Bus Stand",
          duration: "4 hr",
          costPerPerson: 165,
        },
      ],
      train: [
        {
          name: "Kirandul Passenger (Scenic Route)",
          departure: "Visakhapatnam Railway Station",
          arrival: "Araku Railway Station",
          duration: "5 hr",
          costPerPerson: 65,
        },
      ],
      flight: [],
      car: [
        {
          name: "Private Cab (Ghat Road)",
          departure: "Visakhapatnam",
          arrival: "Araku Valley",
          duration: "3 hr",
          costPerPerson: 3000, // full car
        },
        {
          name: "Shared Taxi",
          departure: "Visakhapatnam",
          arrival: "Araku Valley",
          duration: "3 hr 15 min",
          costPerPerson: 400,
        },
      ],
    },

    vizianagaram: {
      bus: [
        {
          name: "Vizag → VZM Express",
          departure: "Visakhapatnam Bus Stand",
          arrival: "Vizianagaram Bus Stand",
          duration: "1 hr 30 min",
          costPerPerson: 65,
        },
      ],
      train: [
        {
          name: "Intercity Express",
          departure: "Visakhapatnam Railway Station",
          arrival: "Vizianagaram Railway Station",
          duration: "1 hr 10 min",
          costPerPerson: 45,
        },
      ],
      flight: [],
      car: [
        {
          name: "Private Cab / Shared Taxi",
          departure: "Visakhapatnam",
          arrival: "Vizianagaram",
          duration: "1 hr 15 min",
          costPerPerson: 1200,
        },
      ],
    },

    hyderabad: {
      bus: [
        {
          name: "Vizag → Hyderabad (AC Sleeper)",
          departure: "Visakhapatnam Bus Stand",
          arrival: "Hyderabad MGBS",
          duration: "10 hr",
          costPerPerson: 1100,
        },
        {
          name: "Vizag → Hyderabad (Non-AC)",
          departure: "Visakhapatnam Bus Stand",
          arrival: "Hyderabad MGBS",
          duration: "11 hr",
          costPerPerson: 750,
        },
      ],
      train: [
        {
          name: "East Coast Express",
          departure: "Visakhapatnam Railway Station",
          arrival: "Hyderabad Kacheguda",
          duration: "10 hr 30 min",
          costPerPerson: 500,
        },
        {
          name: "Godavari Express",
          departure: "Visakhapatnam Railway Station",
          arrival: "Hyderabad Secunderabad",
          duration: "10 hr",
          costPerPerson: 580,
        },
      ],
      flight: [
        {
          name: "IndiGo VTZ → HYD",
          departure: "Visakhapatnam Airport (VTZ)",
          arrival: "Hyderabad Rajiv Gandhi Airport (HYD)",
          duration: "1 hr 10 min",
          costPerPerson: 3200,
        },
        {
          name: "Air India VTZ → HYD",
          departure: "Visakhapatnam Airport (VTZ)",
          arrival: "Hyderabad Rajiv Gandhi Airport (HYD)",
          duration: "1 hr 15 min",
          costPerPerson: 4000,
        },
        {
          name: "StarAir VTZ → HYD",
          departure: "Visakhapatnam Airport (VTZ)",
          arrival: "Hyderabad Rajiv Gandhi Airport (HYD)",
          duration: "1 hr",
          costPerPerson: 2900,
        },
      ],
      car: [
        {
          name: "Private Cab (NH-16)",
          departure: "Visakhapatnam",
          arrival: "Hyderabad",
          duration: "8 hr",
          costPerPerson: 7500,
        },
      ],
    },
  },

  // ── Hyderabad ─────────────────────────────────────────────────────────────
  hyderabad: {
    visakhapatnam: {
      bus: [
        {
          name: "Hyd → Vizag (AC Sleeper)",
          departure: "Hyderabad MGBS",
          arrival: "Visakhapatnam Bus Stand",
          duration: "10 hr",
          costPerPerson: 1100,
        },
        {
          name: "Hyd → Vizag (Non-AC)",
          departure: "Hyderabad MGBS",
          arrival: "Visakhapatnam Bus Stand",
          duration: "11 hr",
          costPerPerson: 750,
        },
      ],
      train: [
        {
          name: "East Coast Express",
          departure: "Hyderabad Kacheguda",
          arrival: "Visakhapatnam Railway Station",
          duration: "10 hr 30 min",
          costPerPerson: 500,
        },
        {
          name: "Godavari Express",
          departure: "Hyderabad Secunderabad",
          arrival: "Visakhapatnam Railway Station",
          duration: "10 hr",
          costPerPerson: 580,
        },
      ],
      flight: [
        {
          name: "IndiGo HYD → VTZ",
          departure: "Hyderabad Rajiv Gandhi Airport (HYD)",
          arrival: "Visakhapatnam Airport (VTZ)",
          duration: "1 hr 10 min",
          costPerPerson: 3200,
        },
        {
          name: "Air India HYD → VTZ",
          departure: "Hyderabad Rajiv Gandhi Airport (HYD)",
          arrival: "Visakhapatnam Airport (VTZ)",
          duration: "1 hr 15 min",
          costPerPerson: 4000,
        },
      ],
      car: [
        {
          name: "Private Cab (NH-16)",
          departure: "Hyderabad",
          arrival: "Visakhapatnam",
          duration: "8 hr",
          costPerPerson: 7500,
        },
      ],
    },

    vizianagaram: {
      bus: [
        {
          name: "Hyd → VZM (Sleeper AC)",
          departure: "Hyderabad MGBS",
          arrival: "Vizianagaram Bus Stand",
          duration: "11 hr",
          costPerPerson: 1200,
        },
        {
          name: "Hyd → VZM (Non-AC)",
          departure: "Hyderabad MGBS",
          arrival: "Vizianagaram Bus Stand",
          duration: "12 hr",
          costPerPerson: 900,
        },
      ],
      train: [
        {
          name: "Godavari Express",
          departure: "Hyderabad Secunderabad",
          arrival: "Vizianagaram Railway Station",
          duration: "12 hr",
          costPerPerson: 550,
        },
        {
          name: "East Coast Express",
          departure: "Hyderabad Kacheguda",
          arrival: "Vizianagaram Railway Station",
          duration: "11 hr 30 min",
          costPerPerson: 480,
        },
      ],
      flight: [
        {
          name: "IndiGo HYD → VTZ",
          departure: "Hyderabad Rajiv Gandhi Airport (HYD)",
          arrival: "Visakhapatnam Airport (VTZ)",
          duration: "1 hr 10 min",
          costPerPerson: 3500,
        },
      ],
      car: [
        {
          name: "Private Cab (NH-16)",
          departure: "Hyderabad",
          arrival: "Vizianagaram",
          duration: "9 hr",
          costPerPerson: 8000,
        },
      ],
    },
  },

  // ── Araku ─────────────────────────────────────────────────────────────────
  araku: {
    visakhapatnam: {
      bus: [
        {
          name: "Araku → Vizag (APSRTC)",
          departure: "Araku Valley Bus Stand",
          arrival: "Visakhapatnam Bus Stand",
          duration: "3 hr 30 min",
          costPerPerson: 135,
        },
      ],
      train: [
        {
          name: "Kirandul Passenger (Scenic Route)",
          departure: "Araku Railway Station",
          arrival: "Visakhapatnam Railway Station",
          duration: "5 hr",
          costPerPerson: 65,
        },
      ],
      flight: [],
      car: [
        {
          name: "Private Cab (Ghat Road)",
          departure: "Araku Valley",
          arrival: "Visakhapatnam",
          duration: "3 hr",
          costPerPerson: 3000,
        },
      ],
    },

    vizianagaram: {
      bus: [
        {
          name: "Araku → VZM (APSRTC)",
          departure: "Araku Valley Bus Stand",
          arrival: "Vizianagaram Bus Stand",
          duration: "4 hr",
          costPerPerson: 120,
        },
      ],
      train: [],
      flight: [],
      car: [
        {
          name: "Private Cab",
          departure: "Araku Valley",
          arrival: "Vizianagaram",
          duration: "3 hr 30 min",
          costPerPerson: 2500,
        },
      ],
    },
  },
};