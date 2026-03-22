import { defaultTripImages } from '@/mocks/destinations';

export function normalizeCity(city: string): string {
    const val = city.toLowerCase().trim();
    if (val.includes('vizag') || val.includes('visakh')) return 'visakhapatnam';
    if (val.includes('vzm') || val.includes('vizian')) return 'vizianagaram';
    if (val.includes('araku')) return 'araku valley';
    return val;
}

const UNSPLASH_ACCESS_KEY = 'pHchWcSUEce5VFFEjb-YyydeV5xf1hGjmyw1fun4EIM';

// Curated high-quality Unsplash images for specific local destinations to ensure relevance
const CURATED_LOCAL_IMAGES: Record<string, string[]> = {
    'visakhapatnam': [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', // Beach shore
        'https://images.unsplash.com/photo-1520116467321-f14663f25e4c?w=800', // Blue coast
        'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800'  // Ocean
    ],
    'vizianagaram': [
        'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800', // Indian heritage/Fort
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', // Taj style heritage
        'https://images.unsplash.com/photo-1590050752117-23a9d7fc0b29?w=800'  // Palace style
    ],
    'araku valley': [
        'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800', // Hills and Nature
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', // Mountains
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', // Valley landscape
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800'  // Scenic hills
    ]
};

/**
 * Returns a Destination Image using Unsplash API or Curated list.
 * @param destination The name of the destination
 * @returns Image URL string
 */
export async function getDestinationImage(destination: string): Promise<string> {
    const fallbackImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800";
    
    if (!destination || destination.trim() === '') {
        return fallbackImage;
    }

    const cityOnly = destination.split(',')[0].trim();
    const normalizedDestination = normalizeCity(cityOnly).toLowerCase();
    
    // 1. Check curated list first (instant relevance, saves quota)
    if (CURATED_LOCAL_IMAGES[normalizedDestination]) {
        return CURATED_LOCAL_IMAGES[normalizedDestination][0];
    }

    // 2. Fetch from Unsplash Search API
    try {
        await new Promise(res => setTimeout(res, 300));
        
        let enhancedQuery = `${normalizedDestination} india tourism travel landscape`;
        // Moving client_id to query params to bypass potential header stripping issues
        const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(enhancedQuery)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;

        const response = await fetch(endpoint, {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0].urls?.regular || data.results[0].urls?.small;
            }
        }
    } catch (error) {
        console.error("Unsplash fetch failed:", error);
    }
    
    return fallbackImage;
}

/**
 * Returns an array of Destination Images for Gallery logic using Unsplash.
 */
export async function getDestinationImages(destination: string, count: number = 4): Promise<string[]> {
    if (!destination) return [];
    
    const cityOnly = destination.split(',')[0].trim();
    const normalizedDestination = normalizeCity(cityOnly).toLowerCase();

    // 1. Curated list check
    if (CURATED_LOCAL_IMAGES[normalizedDestination]) {
        const curated = CURATED_LOCAL_IMAGES[normalizedDestination];
        return curated.slice(0, count);
    }

    // 2. Unsplash API call
    try {
        await new Promise(res => setTimeout(res, 300));
        const query = `${normalizedDestination} india landmarks landscape nature`;
        // Moving client_id to query params to bypass potential header stripping issues
        const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
        
        const response = await fetch(endpoint, { method: 'GET' });

        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results.map((r: any) => r.urls.regular || r.urls.small);
            }
        }
    } catch (e) {
        console.error("Unsplash gallery fetch failed", e);
    }

    // Fallback to default trip images
    return defaultTripImages.slice(0, count);
}

/**
 * Checks if an image URL is one of the generic/random placeholders.
 */
export function isGenericImage(url: string): boolean {
    if (!url) return true;
    const genericIdentifiers = [
        ...defaultTripImages.map(u => u.split('?')[0]),
        'images.pexels.com', // Flag any remaining pexels placeholders
        'images.unsplash.com/photo-1476514525535', // Unsplash default fallback
        'images.unsplash.com/photo-1524492412937'  // Generic India
    ];
    return genericIdentifiers.some(id => url.includes(id));
}
