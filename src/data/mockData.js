export const PROPERTY_IMAGES = {
    apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
    villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
    plot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
    house: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
    commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
};

export const mockProperties = [
    { id: 1, type: 'apartment', title: 'Luxury 3BHK Apartment', location: 'Banjara Hills, Hyderabad', price: 8500000, area: 1850, bhk: 3, floor: 7, totalFloors: 12, furnishing: 'Semi-Furnished', facing: 'East', ageYears: 2, maintenance: 4500, youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', amenities: ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Club House'], description: 'Premium 3BHK apartment with stunning city views, modern interiors and world-class amenities in the heart of Banjara Hills.', status: 'active', listedDate: '2024-12-15', images: [PROPERTY_IMAGES.apartment], agent: 'admin' },
    { id: 2, type: 'villa', title: 'Spacious 4BHK Villa', location: 'Jubilee Hills, Hyderabad', price: 25000000, area: 4200, plotArea: 6000, bhk: 4, garden: true, pool: true, floors: 3, parking: 4, description: 'Grand villa in an elite locality with landscaped garden, private pool and premium finishes throughout.', status: 'active', listedDate: '2024-11-20', images: [PROPERTY_IMAGES.villa], agent: 'admin' },
    { id: 3, type: 'plot', title: 'Residential Plot', location: 'Kompally, Hyderabad', price: 3200000, area: 300, dimensions: '15m x 20m', zone: 'Residential', cornerPlot: true, roadWidth: '30ft', description: 'Prime residential plot in a fast-developing locality with all approvals in place.', status: 'active', listedDate: '2025-01-05', images: [PROPERTY_IMAGES.plot], agent: 'manager' },
    { id: 4, type: 'house', title: 'Independent House 3BHK', location: 'Dilsukhnagar, Hyderabad', price: 9800000, area: 2200, plotArea: 3000, bhk: 3, floors: 2, parking: 2, ageYears: 5, description: 'Well-maintained independent house with terrace, parking and modern kitchen in a prime residential area.', status: 'active', listedDate: '2024-10-30', images: [PROPERTY_IMAGES.house], agent: 'admin' },
    { id: 5, type: 'commercial', title: 'Grade A Office Space', location: 'HITEC City, Hyderabad', price: 18000000, area: 3500, spaceType: 'Office', floor: 4, totalFloors: 18, cabins: 12, washrooms: 6, powerLoad: '100KW', description: 'Premium Grade A office space in HITEC City tech corridor, ideal for MNCs and IT companies.', status: 'active', listedDate: '2025-01-18', images: [PROPERTY_IMAGES.commercial], agent: 'admin' },
    { id: 6, type: 'apartment', title: '2BHK Modern Apartment', location: 'Gachibowli, Hyderabad', price: 5500000, area: 1100, bhk: 2, floor: 3, totalFloors: 8, furnishing: 'Fully Furnished', facing: 'North', ageYears: 1, maintenance: 3500, amenities: ['Gym', 'Security', 'Parking'], description: 'Ready to move 2BHK with modular kitchen and modern fittings near major IT parks.', status: 'active', listedDate: '2025-02-01', images: [PROPERTY_IMAGES.apartment], agent: 'manager' },
    { id: 7, type: 'villa', title: 'Classic 5BHK Villa', location: 'Film Nagar, Hyderabad', price: 45000000, area: 6500, plotArea: 9000, bhk: 5, garden: true, pool: true, floors: 3, parking: 6, description: 'Luxurious villa spread across 6500 sqft with home theatre, pool, and servant quarters.', status: 'active', listedDate: '2024-09-15', images: [PROPERTY_IMAGES.villa], agent: 'admin' },
    { id: 8, type: 'commercial', title: 'Retail Showroom Space', location: 'Kukatpally, Hyderabad', price: 7500000, area: 1800, spaceType: 'Retail', floor: 1, totalFloors: 5, cabins: 2, washrooms: 3, powerLoad: '60KW', description: 'Ground floor retail showroom in a busy commercial area with high footfall and parking.', status: 'active', listedDate: '2025-02-15', images: [PROPERTY_IMAGES.commercial], agent: 'admin' },
    { id: 9, type: 'apartment', title: '1BHK Starter Apartment', location: 'Miyapur, Hyderabad', price: 2800000, area: 680, bhk: 1, floor: 2, totalFloors: 6, furnishing: 'Unfurnished', facing: 'West', ageYears: 3, maintenance: 2000, amenities: ['Security', 'Parking'], description: 'Affordable 1BHK in a well-connected area, perfect for first-time buyers and investors.', status: 'sold', listedDate: '2024-07-10', soldDate: '2024-10-20', images: [PROPERTY_IMAGES.apartment], agent: 'manager' },
    { id: 10, type: 'plot', title: 'Commercial Plot', location: 'Nanakramguda, Hyderabad', price: 12000000, area: 500, dimensions: '25m x 20m', zone: 'Commercial', cornerPlot: false, roadWidth: '60ft', description: 'Strategic commercial plot on main road in HITECH city financial district.', status: 'sold', listedDate: '2024-06-01', soldDate: '2024-09-15', images: [PROPERTY_IMAGES.plot], agent: 'admin' },
    { id: 11, type: 'house', title: 'Duplex House 4BHK', location: 'Attapur, Hyderabad', price: 12500000, area: 3200, plotArea: 2800, bhk: 4, floors: 2, parking: 2, ageYears: 4, description: 'Elegant duplex house with premium interiors, modular kitchen and ample natural lighting.', status: 'sold', listedDate: '2024-05-20', soldDate: '2024-08-30', images: [PROPERTY_IMAGES.house], agent: 'admin' },
    { id: 12, type: 'villa', title: 'Weekend Villa', location: 'Shamirpet, Hyderabad', price: 15000000, area: 3800, plotArea: 7000, bhk: 3, garden: true, pool: true, floors: 2, parking: 3, description: 'Serene forest-view villa with organic garden and eco-friendly design.', status: 'sold', listedDate: '2024-04-10', soldDate: '2024-07-25', images: [PROPERTY_IMAGES.villa], agent: 'admin' },
];

export const mockLeads = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', phone: '+91 98765 43210', interest: 'Apartment', message: 'Looking for a 3BHK apartment in Banjara Hills or Jubilee Hills within 90 lakhs budget.', date: '2025-03-10', status: 'new' },
    { id: 2, name: 'Priya Reddy', email: 'priya.reddy@yahoo.com', phone: '+91 87654 32109', interest: 'Villa', message: 'Interested in premium villas in Film Nagar area. Budget is around 4-5 crores.', date: '2025-03-09', status: 'inprogress' },
    { id: 3, name: 'Arun Kumar', email: 'arun.kumar@outlook.com', phone: '+91 76543 21098', interest: 'Plot', message: 'Need a 300-400 sqyd plot in Kompally or Bachupally for house construction.', date: '2025-03-08', status: 'new' },
    { id: 4, name: 'Sunita Verma', email: 'sunita.verma@gmail.com', phone: '+91 65432 10987', interest: 'Commercial Space', message: 'Looking to lease office space in HITEC City for 50-person team. Min 2500 sqft.', date: '2025-03-07', status: 'closed' },
    { id: 5, name: 'Mohammed Ali', email: 'mohammed.ali@hotmail.com', phone: '+91 54321 09876', interest: 'Individual House', message: 'Searching for an individual house in Dilsukhnagar or LB Nagar within 1 crore.', date: '2025-03-06', status: 'inprogress' },
    { id: 6, name: 'Kavita Patel', email: 'kavita.patel@gmail.com', phone: '+91 43210 98765', interest: 'Apartment', message: 'First-time home buyer, need 2BHK near metro line in Gachibowli area under 60 lakhs.', date: '2025-03-05', status: 'new' },
    { id: 7, name: 'Venkat Rao', email: 'venkat.rao@gmail.com', phone: '+91 32109 87654', interest: 'Villa', message: 'Looking for villa with private pool in Jubilee Hills or Madhapur top area.', date: '2025-03-04', status: 'closed' },
    { id: 8, name: 'Deepa Singh', email: 'deepa.singh@gmail.com', phone: '+91 21098 76543', interest: 'Apartment', message: 'NRI looking for investment apartment in reputed society close to HITECH City.', date: '2025-03-03', status: 'inprogress' },
    { id: 9, name: 'Shyam Gupta', email: 'shyam.gupta@email.com', phone: '+91 10987 65432', interest: 'Plot', message: 'Commercial plot needed on main road for petro station. Min 500 sqyd.', date: '2025-02-28', status: 'new' },
    { id: 10, name: 'Anita Nair', email: 'anita.nair@gmail.com', phone: '+91 99876 54321', interest: 'Commercial Space', message: 'Hospitality brand looking for retail space in high street location.', date: '2025-02-26', status: 'closed' },
    { id: 11, name: 'Ravi Teja', email: 'ravi.teja@gmail.com', phone: '+91 88765 43210', interest: 'Individual House', message: 'Need G+1 house with open terrace in Manikonda budget 1.2 crore.', date: '2025-02-24', status: 'inprogress' },
    { id: 12, name: 'Pooja Mehta', email: 'pooja.mehta@gmail.com', phone: '+91 77654 32109', interest: 'Apartment', message: '4BHK luxury apartment in premium gated community, budget 2CR.', date: '2025-02-22', status: 'new' },
];

export const dashboardStats = {
    totalProperties: 12,
    activeProperties: 8,
    soldProperties: 4,
    totalVisitors: 3847,
    totalLeads: 12,
    monthlyData: [
        { month: 'Oct', listings: 3, leads: 12, visitors: 520 },
        { month: 'Nov', listings: 5, leads: 18, visitors: 630 },
        { month: 'Dec', listings: 4, leads: 15, visitors: 580 },
        { month: 'Jan', listings: 7, leads: 22, visitors: 790 },
        { month: 'Feb', listings: 6, leads: 20, visitors: 720 },
        { month: 'Mar', listings: 8, leads: 28, visitors: 607 },
    ],
    propertyTypeData: [
        { name: 'Apartment', value: 4, color: '#f5b642' },
        { name: 'Villa', value: 3, color: '#3B82F6' },
        { name: 'Plot', value: 2, color: '#22C55E' },
        { name: 'House', value: 2, color: '#F59E0B' },
        { name: 'Commercial', value: 2, color: '#EF4444' },
    ],
};
