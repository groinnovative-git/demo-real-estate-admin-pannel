// ── Amenities master list per property type ─────────────────────────────────
// Keys match the frontend route params used in TYPE_CONFIG / Sidebar:
//   apartment | villa | plot | house | commercial | farmland | pg

const amenitiesByPropertyType = {
    apartment: [
        'Lift',
        'Car Parking',
        'Visitor Parking',
        'Power Backup',
        '24/7 Water Supply',
        'Security',
        'CCTV',
        'Gated Community',
        'Gym',
        'Swimming Pool',
        'Club House',
        'Party Hall',
        "Children's Play Area",
        'Park',
        'Walking Track',
        'Intercom',
        'Wi-Fi',
        'Fire Safety',
        'Rainwater Harvesting',
        'Waste Management',
        'Senior Citizen Area',
    ],

    villa: [
        'Car Parking',
        'Visitor Parking',
        'Private Garden',
        'Terrace',
        'Balcony',
        'Power Backup',
        '24/7 Water Supply',
        'Security',
        'CCTV',
        'Gated Community',
        'Gym',
        'Swimming Pool',
        'Club House',
        'Party Hall',
        "Children's Play Area",
        'Park',
        'Walking Track',
        'Servant Room',
        'Solar Power',
        'EV Charging Point',
        'Rainwater Harvesting',
    ],

    plot: [
        'Gated Community',
        'Black Top Road',
        'Corner Plot',
        'Street Lights',
        'Drainage Connection',
        'Water Connection',
        'Electricity Connection',
        'Underground Sewage',
        'Avenue Trees',
        'CCTV',
        'Security',
        'Park',
        "Children's Play Area",
        'Compound Wall',
        'Fencing',
        'Ready for Construction',
    ],

    farmland: [
        'Fencing',
        'Road Access',
        'Water Source',
        'Borewell',
        'EB Connection',
        'Drip Irrigation',
        'Sprinkler System',
        'Farm House',
        'Storage Shed',
        'Cattle Shed',
        'Watchman Room',
        'Solar Pump',
        'Tree Plantation',
        'Organic Farming Ready',
        'River Access',
        'Lake View',
        'Hill View',
    ],

    house: [
        'Car Parking',
        'Private Entrance',
        'Balcony',
        'Terrace',
        'Private Garden',
        'Power Backup',
        '24/7 Water Supply',
        'Municipality Water Supply',
        'Borewell',
        'EB Connection',
        'Security',
        'CCTV',
        'Wi-Fi',
        'Intercom',
        'Rainwater Harvesting',
        'Solar Power',
        'EV Charging Point',
        'Servant Room',
        'Store Room',
        'Modular Kitchen',
    ],

    commercial: [
        'Car Parking',
        'Visitor Parking',
        'Lift',
        'Power Backup',
        '24/7 Water Supply',
        'Security',
        'CCTV',
        'Fire Safety',
        'Centralized AC',
        'Wi-Fi',
        'Reception Area',
        'Conference Room',
        'Pantry',
        'Restrooms',
        'Service Lift',
        'Loading Bay',
        'Wheelchair Access',
        'Maintenance Staff',
        'Generator Backup',
        'Waste Management',
    ],

    pg: [
        'Food Included',
        'WiFi',
        'Washing Machine',
        'Power Backup',
        'Housekeeping',
        'Bed',
        'Cupboard',
        'Table',
        'Chair',
        'AC',
        'TV',
        'Geyser',
        'CCTV',
        'Security Guard',
        'Shared Kitchen',
        'Cooking Allowed',
    ],
};

/**
 * Returns the amenities list for a given property type key.
 * Falls back to an empty array for unknown types.
 */
export function getAmenitiesForType(typeKey) {
    return amenitiesByPropertyType[typeKey] || [];
}

/**
 * Returns a flat, de-duplicated list of ALL amenity labels across every property type.
 * Useful for building the full backend mapping.
 */
export function getAllAmenityLabels() {
    const all = new Set();
    Object.values(amenitiesByPropertyType).forEach(list =>
        list.forEach(a => all.add(a)),
    );
    return [...all];
}

export default amenitiesByPropertyType;
