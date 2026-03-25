// ── Leads mock data ────────────────────────────────────────────────────────
// Kept until a real Leads API endpoint is available.

export const mockLeads = [
    { id: 1,  name: 'Rahul Sharma',   email: 'rahul.sharma@gmail.com',   phone: '+91 98765 43210', interest: 'Apartment',        message: 'Looking for a 3BHK apartment in Banjara Hills or Jubilee Hills within 90 lakhs budget.',   date: '2025-03-10', status: 'new' },
    { id: 2,  name: 'Priya Reddy',    email: 'priya.reddy@yahoo.com',    phone: '+91 87654 32109', interest: 'Villa',             message: 'Interested in premium villas in Film Nagar area. Budget is around 4-5 crores.',              date: '2025-03-09', status: 'inprogress' },
    { id: 3,  name: 'Arun Kumar',     email: 'arun.kumar@outlook.com',   phone: '+91 76543 21098', interest: 'Plot',              message: 'Need a 300-400 sqyd plot in Kompally or Bachupally for house construction.',                 date: '2025-03-08', status: 'new' },
    { id: 4,  name: 'Sunita Verma',   email: 'sunita.verma@gmail.com',   phone: '+91 65432 10987', interest: 'Commercial Space',  message: 'Looking to lease office space in HITEC City for 50-person team. Min 2500 sqft.',           date: '2025-03-07', status: 'closed' },
    { id: 5,  name: 'Mohammed Ali',   email: 'mohammed.ali@hotmail.com', phone: '+91 54321 09876', interest: 'Individual House',  message: 'Searching for an individual house in Dilsukhnagar or LB Nagar within 1 crore.',             date: '2025-03-06', status: 'inprogress' },
    { id: 6,  name: 'Kavita Patel',   email: 'kavita.patel@gmail.com',   phone: '+91 43210 98765', interest: 'Apartment',        message: 'First-time home buyer, need 2BHK near metro line in Gachibowli area under 60 lakhs.',      date: '2025-03-05', status: 'new' },
    { id: 7,  name: 'Venkat Rao',     email: 'venkat.rao@gmail.com',     phone: '+91 32109 87654', interest: 'Villa',             message: 'Looking for villa with private pool in Jubilee Hills or Madhapur top area.',                date: '2025-03-04', status: 'closed' },
    { id: 8,  name: 'Deepa Singh',    email: 'deepa.singh@gmail.com',    phone: '+91 21098 76543', interest: 'Apartment',        message: 'NRI looking for investment apartment in reputed society close to HITECH City.',             date: '2025-03-03', status: 'inprogress' },
    { id: 9,  name: 'Shyam Gupta',    email: 'shyam.gupta@email.com',    phone: '+91 10987 65432', interest: 'Plot',              message: 'Commercial plot needed on main road for petro station. Min 500 sqyd.',                     date: '2025-02-28', status: 'new' },
    { id: 10, name: 'Anita Nair',     email: 'anita.nair@gmail.com',     phone: '+91 99876 54321', interest: 'Commercial Space',  message: 'Hospitality brand looking for retail space in high street location.',                      date: '2025-02-26', status: 'closed' },
    { id: 11, name: 'Ravi Teja',      email: 'ravi.teja@gmail.com',      phone: '+91 88765 43210', interest: 'Individual House',  message: 'Need G+1 house with open terrace in Manikonda budget 1.2 crore.',                         date: '2025-02-24', status: 'inprogress' },
    { id: 12, name: 'Pooja Mehta',    email: 'pooja.mehta@gmail.com',    phone: '+91 77654 32109', interest: 'Apartment',        message: '4BHK luxury apartment in premium gated community, budget 2CR.',                            date: '2025-02-22', status: 'new' },
];

// ── Dashboard chart data ────────────────────────────────────────────────────
// Static trend data for the "Properties Sold" area chart.
// Replace with a real API endpoint when available.

export const chartMonthlyData = [
    { month: 'Oct', listings: 3, leads: 12, visitors: 520 },
    { month: 'Nov', listings: 5, leads: 18, visitors: 630 },
    { month: 'Dec', listings: 4, leads: 15, visitors: 580 },
    { month: 'Jan', listings: 7, leads: 22, visitors: 790 },
    { month: 'Feb', listings: 6, leads: 20, visitors: 720 },
    { month: 'Mar', listings: 8, leads: 28, visitors: 607 },
];

export const totalVisitors = 3847;
