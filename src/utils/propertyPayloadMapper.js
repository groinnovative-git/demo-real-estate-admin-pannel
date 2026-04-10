import amenitiesByPropertyType from '../data/amenitiesByPropertyType';

// ── Amenity label ↔ backend boolean field mapping ─────────────────────────
// Field names MUST match the C# model exactly (verified against API response).

const AMENITY_TO_FIELD = {
    // ── Shared / common ──
    'Swimming Pool':          'hasSwimmingPool',
    'Gym':                    'hasGym',
    'Security':               'hasSecurity',
    'Car Parking':            'hasParking',
    'Visitor Parking':        'hasVisitorParking',
    'Club House':             'hasClubHouse',
    'Power Backup':           'hasPowerBackup',
    'Lift':                   'hasLift',
    'CCTV':                   'hasCCTV',
    'Intercom':               'hasIntercom',
    'Fire Safety':            'hasFireSafety',
    '24/7 Water Supply':      'hasWaterSupply24x7',
    'Gated Community':        'hasGatedCommunity',
    'Park':                   'hasPark',
    "Children's Play Area":   'hasKidsPlayArea',
    'Walking Track':          'hasWalkingTrack',
    'Wi-Fi':                  'hasWiFi',
    'Rainwater Harvesting':   'hasRainwaterHarvesting',
    'Waste Management':       'hasWasteManagement',
    'Solar Power':            'hasSolarPower',
    'EV Charging Point':      'hasEVChargingPoint',
    'Fencing':                'hasFencing',

    // ── Apartment ──
    'Party Hall':             'hasPartyHall',
    'Senior Citizen Area':    'hasSeniorCitizenArea',

    // ── Villa ──
    'Private Garden':         'hasGarden',            // backend field is hasGarden
    'Terrace':                'hasTerrace',
    'Balcony':                'hasBalcony',
    'Servant Room':           'hasServantRoom',

    // ── Plot ──
    'Black Top Road':         'hasBlackTopRoad',
    'Corner Plot':            'hasCornerPlot',
    'Street Lights':          'hasStreetLights',
    'Drainage Connection':    'hasDrainageConnection',
    'Water Connection':       'hasWaterConnection',
    'Electricity Connection': 'hasElectricityConnection',
    'Underground Sewage':     'hasUndergroundSewage',
    'Avenue Trees':           'hasAvenueTrees',
    'Compound Wall':          'hasCompoundWall',
    'Ready for Construction': 'isReadyForConstruction',  // backend uses 'is' prefix

    // ── Farm Land ──
    'Road Access':            'hasRoadAccess',
    'Water Source':           'hasWaterSource',
    'Borewell':               'hasBorewell',
    'EB Connection':          'hasElectricityConnection', // shares field with Electricity Connection
    'Drip Irrigation':        'hasDripIrrigation',
    'Sprinkler System':       'hasSprinklerSystem',
    'Farm House':             'hasFarmHouse',
    'Storage Shed':           'hasStorageShed',
    'Cattle Shed':            'hasCattleShed',
    'Watchman Room':          'hasWatchmanRoom',
    'Solar Pump':             'hasSolarPump',
    'Tree Plantation':        'hasTreePlantation',
    'Organic Farming Ready':  'isOrganicFarmingReady',   // backend uses 'is' prefix
    'River Access':           'hasRiverAccess',
    'Lake View':              'hasLakeView',
    'Hill View':              'hasHillView',

    // ── Private House ──
    'Private Entrance':       'hasPrivateEntrance',
    'Municipality Water Supply': 'hasMunicipalityWaterSupply',
    'Store Room':             'hasStoreRoom',
    'Modular Kitchen':        'hasModularKitchen',

    // ── Commercial ──
    'Centralized AC':         'hasCentralizedAC',
    'Reception Area':         'hasReceptionArea',
    'Conference Room':        'hasConferenceRoom',
    'Pantry':                 'hasPantry',
    'Restrooms':              'hasRestrooms',
    'Service Lift':           'hasServiceLift',
    'Loading Bay':            'hasLoadingBay',
    'Wheelchair Access':      'hasWheelchairAccess',
    'Maintenance Staff':      'hasMaintenanceStaff',
    'Generator Backup':       'hasGeneratorBackup',

    // PG
    'Food Included':          'hasFoodIncluded',
    'WiFi':                   'hasWiFi',
    'Washing Machine':        'hasWashingMachine',
    'Housekeeping':           'hasHousekeeping',
    'Bed':                    'hasBed',
    'Cupboard':               'hasCupboard',
    'Table':                  'hasTable',
    'Chair':                  'hasChair',
    'AC':                     'hasAC',
    'TV':                     'hasTV',
    'Geyser':                 'hasGeyser',
    'Security Guard':         'hasSecurityGuard',
    'Shared Kitchen':         'hasSharedKitchen',
    'Cooking Allowed':        'isCookingAllowed',
};

// ── Reverse mapping: backend field → ALL matching amenity labels ───────────
// Some fields are shared across property types (e.g. hasElectricityConnection
// maps to both "Electricity Connection" (plot) and "EB Connection" (farmland)).
// We store ALL labels so normalizeProperty can reconstruct the correct amenity
// list regardless of property type.
const FIELD_TO_LABELS = {};
Object.entries(AMENITY_TO_FIELD).forEach(([label, field]) => {
    if (!FIELD_TO_LABELS[field]) FIELD_TO_LABELS[field] = [];
    if (!FIELD_TO_LABELS[field].includes(label)) {
        FIELD_TO_LABELS[field].push(label);
    }
});

// Frontend type key → backend propertyType string
const TYPE_LABEL_MAP = {
    apartment: 'Apartment',
    villa:     'Villa',
    plot:      'Plot',
    house:     'IndividualHouse',
    commercial:'Commercial',
    farmland:  'FarmLand',
    pg:        'PG',
};

// Backend propertyType string → frontend type key (reverse)
const BACKEND_TYPE_TO_KEY = Object.fromEntries(
    Object.entries(TYPE_LABEL_MAP).map(([key, label]) => [label.toLowerCase(), key])
);

const IMAGE_SLOT_KEYS = ['img1', 'img2', 'img3', 'img4', 'img5'];
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function toNumericValue(...values) {
    for (const value of values) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string') {
            const cleaned = value.replace(/[^0-9.-]/g, '').trim();
            if (!cleaned) continue;

            const parsed = Number(cleaned);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
    }

    return 0;
}

export function getPropertyDisplayPrice(property) {
    if (!property) return 0;

    return toNumericValue(
        property.price,
        property.Price,
        property.monthlyRent,
        property.MonthlyRent,
        property.propertyPrice,
        property.PropertyPrice
    );
}

function resolveAssetUrl(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    if (trimmed.startsWith('/') && API_BASE_URL) {
        return `${API_BASE_URL}${trimmed}`;
    }
    return trimmed;
}

function toStoredImagePath(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (API_BASE_URL && trimmed.startsWith(API_BASE_URL)) {
        return trimmed.slice(API_BASE_URL.length) || '';
    }
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const parsed = new URL(trimmed);
            return parsed.pathname || trimmed;
        } catch {
            return trimmed;
        }
    }
    return trimmed;
}

function toBooleanValue(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return false;
}

function getListingFlags(listingTypeValue) {
    const listingType = String(listingTypeValue || '').trim().toLowerCase() === 'sale' ? 'sale' : 'rent';

    return {
        listingType,
        isRental: listingType === 'rent',
        isSale: listingType === 'sale',
    };
}

function splitDistance(value) {
    if (value === null || value === undefined) return { dist: '', unit: 'km' };

    const text = String(value).trim();
    if (!text) return { dist: '', unit: 'km' };

    return {
        dist: text.split(' ')[0] || '',
        unit: text.includes('m') && !text.includes('km') ? 'm' : 'km',
    };
}

function resolveListingStatus(data) {
    const rawStatus = String(data.propertyStatus || data.status || '').trim().toLowerCase();
    if (rawStatus === 'sold' || rawStatus === 'sale') return 'sold';
    if (rawStatus === 'active' || rawStatus === 'rent') return 'active';

    return 'active';
}

// Valid fields per property type to avoid sending default/irrelevant data
const TYPE_FIELDS = {
    apartment: ['bedrooms', 'numberOfFloors', 'floorNumber', 'monthlyMaintenance', 'furnishingStatus', 'facingDirection', 'ageOfProperty', 'govApprovedCertificate'],
    villa:     ['plotAreaSqYd', 'bedrooms', 'bathrooms', 'furnishingStatus', 'facingDirection', 'ageOfProperty', 'govApprovedCertificate'],
    plot:      ['plotAreaSqYd', 'facingDirection', 'plotDimensions', 'govApprovedCertificate'],
    house:     ['plotAreaSqYd', 'bedrooms', 'bathrooms', 'numberOfFloors', 'furnishingStatus', 'facingDirection', 'ageOfProperty'],
    commercial:['floorNumber', 'numberOfFloors', 'furnishingStatus', 'washrooms', 'ageOfProperty', 'facingDirection', 'govApprovedCertificate', 'commercialType', 'floorDetails'],
    farmland:  ['totalLandArea', 'pricePerAcre', 'landType', 'govApprovedCertificate'],
    pg:        ['depositAmount', 'availableFrom', 'sharingType', 'genderAllowed', 'foodIncluded', 'ac', 'attachedBathroom', 'furnished']
};


// ── Build API payload from form state ─────────────────────────────────────
/**
 * Converts AddProperty / EditProperty form state into the backend payload.
 *
 * @param {object} form         - form state from AddProperty or EditPropertyModal
 * @param {string} type         - property type key (apartment | villa | plot | house | commercial)
 * @param {string|null} existingId - propertiesDetailsId for UPDATE requests; omit for CREATE
 * @returns {object} API-ready payload
 */
export function buildPropertyPayload(form, type, existingId = null) {
    const amenities = Array.isArray(form.amenities) ? form.amenities : [];

    // Convert amenity label array → individual boolean fields
    const amenityFlags = Object.fromEntries(
        Object.entries(AMENITY_TO_FIELD).map(([label, field]) => [
            field,
            amenities.includes(label),
        ])
    );

    // Resolve the primary built-up area field
    const builtSqFt =
        Number(form.carpetArea) ||
        Number(form.builtUpArea) ||
        Number(form.area) ||
        0;

    const propertyTypeName = TYPE_LABEL_MAP[type] || 'Apartment';
    const mappedPrice =
        type === 'pg'
            ? Number(form.monthlyRent) || Number(form.price) || 0
            : Number(form.price) || 0;
    const { listingType, isRental, isSale } = getListingFlags(form.listingType);
    const propertyStatus = String(form.status || '').trim().toLowerCase() === 'sold' ? 'sold' : 'active';

    // For commercial, subType = commercial category; for others, same as type label
    const subType =
        type === 'commercial'
            ? form.commercialType || propertyTypeName
            : propertyTypeName;

    const valid = TYPE_FIELDS[type] || [];

    const payload = {
        propertyTitle:      String(form.title || '').trim(),
        price:              mappedPrice,
        propertyType:       propertyTypeName,
        propertySubType:    subType,
        isLoanProviding:    Boolean(form.loanSupport),
        propertyLoanPercentage: form.loanSupport ? (Number(form.loanPercentage) || 0) : 0,
        isActive:           propertyStatus === 'active',
        isRental,
        isSale,
        propertyStatus:     propertyStatus === 'sold' ? 'Sold' : 'Active',
        propertySqFt:       builtSqFt,
        
        plotAreaSqYd:       valid.includes('plotAreaSqYd') ? Number(form.plotArea) || 0 : 0,
        bedrooms:           valid.includes('bedrooms') ? Number(form.bhk) || 0 : 0,
        bathrooms:          valid.includes('bathrooms') ? Number(form.bathrooms) || 0 : 0,
        numberOfFloors:     valid.includes('numberOfFloors') ? Number(form.totalFloors) || 0 : 0,
        floorNumber:        valid.includes('floorNumber') ? Number(form.floor) || 0 : 0,
        monthlyMaintenance: valid.includes('monthlyMaintenance') ? Number(form.maintenance) || 0 : 0,
        washrooms:          valid.includes('washrooms') ? Number(form.washrooms) || 0 : 0,
        commercialType:     valid.includes('commercialType') ? form.commercialType || '' : '',
        govApprovedCertificate: valid.includes('govApprovedCertificate') ? form.govApprovedCertificate || '' : '',
        furnishingStatus:   valid.includes('furnishingStatus') ? form.furnishing || '' : '',
        facingDirection:    valid.includes('facingDirection') ? form.facing || '' : '',
        ageOfProperty:      valid.includes('ageOfProperty') ? Number(form.ageYears) || 0 : 0,
        plotDimensions:     valid.includes('plotDimensions') ? form.plotDimensions || '' : '',
        totalLandArea:      valid.includes('totalLandArea') ? form.totalLandArea || '' : '',
        pricePerAcre:       valid.includes('pricePerAcre') ? Number(form.pricePerAcre) || 0 : 0,
        floorDetails:       valid.includes('floorDetails') ? form.floorDetails || '' : '',
        landType:           valid.includes('landType') ? form.landType || '' : '',
        depositAmount:      valid.includes('depositAmount') ? Number(form.depositAmount) || 0 : 0,
        availableFrom:      valid.includes('availableFrom') ? form.availableFrom || '' : '',
        sharingType:        valid.includes('sharingType') ? form.sharingType || '' : '',
        genderAllowed:      valid.includes('genderAllowed') ? form.genderAllowed || '' : '',
        foodIncluded:       valid.includes('foodIncluded') ? toBooleanValue(form.foodIncluded) : false,
        ac:                 valid.includes('ac') ? toBooleanValue(form.ac) : false,
        attachedBathroom:   valid.includes('attachedBathroom') ? toBooleanValue(form.attachedBathroom) : false,
        furnished:          valid.includes('furnished') ? toBooleanValue(form.furnished) : false,
        hospitalDistance:   form.nearbyHospitalDist ? `${form.nearbyHospitalDist} ${form.nearbyHospitalUnit}` : '',
        collegeDistance:    form.nearbyCollegeDist ? `${form.nearbyCollegeDist} ${form.nearbyCollegeUnit}` : '',
        schoolDistance:     form.nearbySchoolDist ? `${form.nearbySchoolDist} ${form.nearbySchoolUnit}` : '',
        railWayStationDistance: form.nearbyStationDist ? `${form.nearbyStationDist} ${form.nearbyStationUnit}` : '',
        busStandDistance:   form.nearbyBusStandDist ? `${form.nearbyBusStandDist} ${form.nearbyBusStandUnit}` : '',
        ...amenityFlags,
        imageUrls:          Array.isArray(form.images) ? form.images : [],
        videoUrl1:          form.shortVideoUrl || '',
        videoUrl2:          form.fullVideoUrl || '',
        description:        form.description || '',
        location:           form.location || '',
    };

    // Include ID only for UPDATE requests
    if (existingId) {
        payload.propertiesDetailsId = existingId;
    }

    return payload;
}

// ── Normalize API response → frontend model ────────────────────────────────
/**
 * Converts the backend property object into the frontend data shape
 * used across PropertyContext, PropertyCard, PropertyDetailModal, etc.
 *
 * @param {object} data - raw API response property object
 * @returns {object} normalized property
 */
export function normalizeProperty(data) {
    if (!data) return null;

    // Map backend propertyType (e.g. "IndividualHouse") to frontend key (e.g. "house")
    const rawType = String(data.propertyType || '').toLowerCase();
    const type    = BACKEND_TYPE_TO_KEY[rawType] || rawType;

    // Reconstruct amenities array from boolean flags.
    // Filter to only labels valid for this property type so that shared fields
    // (e.g. hasElectricityConnection → both "Electricity Connection" for plot
    // and "EB Connection" for farmland/house) never produce duplicate chips.
    const typeAmenitySet = new Set(amenitiesByPropertyType[type] || []);
    const amenities = Object.entries(FIELD_TO_LABELS)
        .filter(([field]) => data[field] === true)
        .flatMap(([, labels]) => labels)
        .filter(label => typeAmenitySet.has(label));

    const valid = TYPE_FIELDS[type] || [];
    const createdAt = data.createdAt || data.CreatedAt || '';
    const updatedAt = data.updatedAt || data.UpdatedAt || '';
    const createdBy = data.createdBy || data.CreatedBy || '';
    const updatedBy = data.updatedBy || data.UpdatedBy || '';
    const status = resolveListingStatus(data);
    const isRental = toBooleanValue(data.isRental);
    const isSale = toBooleanValue(data.isSale);
    const mappedPrice = getPropertyDisplayPrice(data);
    const hospitalDistance = splitDistance(data.hospitalDistance ?? data.HospitalDistance ?? data.nearbyHospital);
    const collegeDistance = splitDistance(data.collegeDistance ?? data.CollegeDistance ?? data.nearbyCollege);
    const schoolDistance = splitDistance(data.schoolDistance ?? data.SchoolDistance ?? data.nearbySchool);
    const stationDistance = splitDistance(data.railWayStationDistance ?? data.RailWayStationDistance ?? data.nearbyStation);
    const busStandDistance = splitDistance(data.busStandDistance ?? data.BusStandDistance ?? data.nearbyBusStand);

    return {
        id:             data.propertiesDetailsId || data.id || '',
        title:          data.propertyTitle       || data.title || '',
        price:          mappedPrice,
        type,
        subType:        data.propertySubType     || '',
        loanSupport:    data.isLoanProviding      || false,
        loanPercentage: Number(data.propertyLoanPercentage ?? data.PropertyLoanPercentage ?? data.loanPercentage) || 0,
        area:           valid.includes('plotAreaSqYd') && !valid.includes('bedrooms') ? 0 : Number(data.propertySqFt) || 0, // area is essentially BuiltUpArea/CarpetArea
        plotArea:       valid.includes('plotAreaSqYd') ? Number(data.plotAreaSqYd) || 0 : 0,
        bhk:            valid.includes('bedrooms') ? Number(data.bedrooms) || 0 : 0,
        bathrooms:      valid.includes('bathrooms') ? Number(data.bathrooms) || 0 : 0,
        totalFloors:    valid.includes('numberOfFloors') ? Number(data.numberOfFloors)|| 0 : 0,
        floor:          valid.includes('floorNumber') ? Number(data.floorNumber)  || 0 : 0,
        maintenance:    valid.includes('monthlyMaintenance') ? Number(data.monthlyMaintenance) || 0 : 0,
        washrooms:      valid.includes('washrooms') ? Number(data.washrooms) || 0 : 0,
        commercialType: valid.includes('commercialType') ? data.commercialType || '' : '',
        govApprovedCertificate: valid.includes('govApprovedCertificate') ? data.govApprovedCertificate || '' : '',
        furnishing:     valid.includes('furnishingStatus') ? data.furnishingStatus || '' : '',
        facing:         valid.includes('facingDirection') ? data.facingDirection || '' : '',
        plotDimensions: valid.includes('plotDimensions') ? data.plotDimensions || '' : '',
        totalLandArea:  valid.includes('totalLandArea') ? data.totalLandArea || '' : '',
        pricePerAcre:   valid.includes('pricePerAcre') ? Number(data.pricePerAcre) || 0 : 0,
        floorDetails:   valid.includes('floorDetails') ? data.floorDetails || '' : '',
        landType:       valid.includes('landType') ? data.landType || '' : '',
        monthlyRent:    type === 'pg' ? mappedPrice : 0,
        depositAmount:  valid.includes('depositAmount') ? Number(data.depositAmount) || 0 : 0,
        availableFrom:  valid.includes('availableFrom') ? data.availableFrom || '' : '',
        sharingType:    valid.includes('sharingType') ? data.sharingType || '' : '',
        genderAllowed:  valid.includes('genderAllowed') ? data.genderAllowed || '' : '',
        foodIncluded:   valid.includes('foodIncluded') ? toBooleanValue(data.foodIncluded ?? data.hasFoodIncluded) : '',
        ac:             valid.includes('ac') ? toBooleanValue(data.ac ?? data.hasAC) : '',
        attachedBathroom: valid.includes('attachedBathroom') ? toBooleanValue(data.attachedBathroom ?? data.hasAttachedBathroom) : '',
        furnished:      valid.includes('furnished') ? toBooleanValue(data.furnished ?? data.isFurnished) : '',
        ageYears:       valid.includes('ageOfProperty') ? Number(data.ageOfProperty) || 0 : 0,
        amenities,
        images:         IMAGE_SLOT_KEYS
                            .map(key => resolveAssetUrl(data[key]))
                            .filter(value => typeof value === 'string' && value.trim() !== '')
                            .map(value => value.trim())
                            .concat(
                                IMAGE_SLOT_KEYS.some(key => typeof data[key] === 'string' && data[key].trim() !== '')
                                    ? []
                                    : typeof data.imageUrls === 'string' && data.imageUrls
                                        ? data.imageUrls.split(';').map(resolveAssetUrl).filter(Boolean)
                                        : Array.isArray(data.imageUrls) ? data.imageUrls.map(resolveAssetUrl).filter(Boolean)
                                        : Array.isArray(data.images) ? data.images.map(resolveAssetUrl).filter(Boolean)
                                        : []
                            ),
        shortVideoUrl:  data.videoUrl1            || '',
        fullVideoUrl:   data.videoUrl2            || '',
        description:    data.description          || '',
        location:       data.location             || '',
        mapEmbedSrc:    data.locationIframe        || '',
        // ── Nearby Locations ──
        nearbyHospitalDist: hospitalDistance.dist, nearbyHospitalUnit: hospitalDistance.unit,
        nearbyCollegeDist: collegeDistance.dist, nearbyCollegeUnit: collegeDistance.unit,
        nearbySchoolDist: schoolDistance.dist, nearbySchoolUnit: schoolDistance.unit,
        nearbyStationDist: stationDistance.dist, nearbyStationUnit: stationDistance.unit,
        nearbyBusStandDist: busStandDistance.dist, nearbyBusStandUnit: busStandDistance.unit,
        status,
        isRental,
        isSale,
        isActive:       data.isActive ?? true,
        listedDate:     data.listedDate           || new Date().toISOString().split('T')[0],
        createdBy,
        createdAt,
        updatedBy,
        updatedAt,
    };
}


// ── Extract clean URL from iframe/plain string ─────────────────────────────
/**
 * Returns a clean URL from a YouTube iframe embed string or plain URL.
 * Strips <iframe src="..."> wrappers if present.
 */
export function extractVideoUrl(input) {
    if (!input) return '';
    const str = String(input).trim();
    // Extract src attribute from <iframe ...>
    const srcMatch = str.match(/src=["']([^"']+)["']/i);
    if (srcMatch) return srcMatch[1];
    // If already a plain URL
    if (str.startsWith('http://') || str.startsWith('https://')) return str;
    return '';
}

// ── Build multipart/form-data payload ─────────────────────────────────────
/**
 * Builds a FormData object matching the backend PropertyRequest C# model.
 *
 * @param {object} form         - form state (must include `images` for existing URLs)
 * @param {string} type         - property type key (apartment | villa | plot | house | commercial)
 * @param {File[]} imageFiles   - actual File objects from the file input (new uploads)
 * @param {string|null} existingId - propertiesDetailsId for UPDATE requests; omit for CREATE
 * @returns {FormData}
 */
export function buildPropertyFormData(form, type, imageFiles = [], existingId = null) {
    const amenities = Array.isArray(form.amenities) ? form.amenities : [];

    const amenityFlags = Object.fromEntries(
        Object.entries(AMENITY_TO_FIELD).map(([label, field]) => [field, amenities.includes(label)])
    );

    const builtSqFt =
        Number(form.carpetArea) ||
        Number(form.builtUpArea) ||
        Number(form.area) ||
        0;

    const propertyTypeName = TYPE_LABEL_MAP[type] || 'Apartment';
    const mappedPrice =
        type === 'pg'
            ? Number(form.monthlyRent) || Number(form.price) || 0
            : Number(form.price) || 0;
    const subType = type === 'commercial'
        ? (form.commercialType || propertyTypeName)
        : propertyTypeName;

    const valid = TYPE_FIELDS[type] || [];
    const { listingType, isRental, isSale } = getListingFlags(form.listingType);
    const propertyStatus = String(form.status || '').trim().toLowerCase() === 'sold' ? 'sold' : 'active';

    const fd = new FormData();

    if (existingId) fd.append('PropertiesDetailsId', existingId);

    fd.append('PropertyTitle',      String(form.title || '').trim());
    fd.append('Price',              String(mappedPrice));
    fd.append('PropertyType',       propertyTypeName);
    fd.append('PropertySubType',    subType);
    fd.append('IsLoanProviding',    String(Boolean(form.loanSupport)));
    fd.append('PropertyLoanPercentage', String(form.loanSupport ? (Number(form.loanPercentage) || 0) : 0));
    fd.append('IsActive',           String(propertyStatus === 'active'));
    fd.append('IsRental',           String(isRental));
    fd.append('IsSale',             String(isSale));
    fd.append('PropertyStatus',     propertyStatus === 'sold' ? 'Sold' : 'Active');
    fd.append('PropertySqFt',       String(builtSqFt));

    fd.append('PlotAreaSqYd',       valid.includes('plotAreaSqYd') ? String(Number(form.plotArea) || 0) : '0');
    fd.append('Bedrooms',           valid.includes('bedrooms') ? String(Number(form.bhk) || 0) : '0');
    fd.append('Bathrooms',          valid.includes('bathrooms') ? String(Number(form.bathrooms) || 0) : '0');
    fd.append('NumberOfFloors',     valid.includes('numberOfFloors') ? String(Number(form.totalFloors) || 0) : '0');
    fd.append('FloorNumber',        valid.includes('floorNumber') ? String(Number(form.floor) || 0) : '0');
    fd.append('MonthlyMaintenance', valid.includes('monthlyMaintenance') ? String(Number(form.maintenance) || 0) : '0');
    fd.append('Washrooms',          valid.includes('washrooms') ? String(Number(form.washrooms) || 0) : '0');
    fd.append('CommercialType',     valid.includes('commercialType') ? form.commercialType || '' : '');
    fd.append('GovApprovedCertificate', valid.includes('govApprovedCertificate') ? form.govApprovedCertificate || '' : '');
    fd.append('PlotDimensions',     valid.includes('plotDimensions') ? form.plotDimensions || '' : '');
    fd.append('TotalLandArea',      valid.includes('totalLandArea') ? form.totalLandArea || '' : '');
    fd.append('PricePerAcre',       valid.includes('pricePerAcre') ? String(Number(form.pricePerAcre) || 0) : '0');
    fd.append('FloorDetails',       valid.includes('floorDetails') ? form.floorDetails || '' : '');
    fd.append('LandType',           valid.includes('landType') ? form.landType || '' : '');
    fd.append('FurnishingStatus',   valid.includes('furnishingStatus') ? form.furnishing || '' : '');
    fd.append('FacingDirection',    valid.includes('facingDirection') ? form.facing || '' : '');
    fd.append('AgeOfProperty',      valid.includes('ageOfProperty') ? String(Number(form.ageYears) || 0) : '0');
    fd.append('MonthlyRent',        type === 'pg' ? String(mappedPrice) : '0');
    fd.append('DepositAmount',      valid.includes('depositAmount') ? String(Number(form.depositAmount) || 0) : '0');
    fd.append('AvailableFrom',      valid.includes('availableFrom') ? form.availableFrom || '' : '');
    fd.append('SharingType',        valid.includes('sharingType') ? form.sharingType || '' : '');
    fd.append('GenderAllowed',      valid.includes('genderAllowed') ? form.genderAllowed || '' : '');
    fd.append('FoodIncluded',       valid.includes('foodIncluded') ? String(toBooleanValue(form.foodIncluded)) : 'false');
    fd.append('HasAC',              valid.includes('ac') ? String(toBooleanValue(form.ac)) : 'false');
    fd.append('HasAttachedBathroom', valid.includes('attachedBathroom') ? String(toBooleanValue(form.attachedBathroom)) : 'false');
    fd.append('IsFurnished',        valid.includes('furnished') ? String(toBooleanValue(form.furnished)) : 'false');
    fd.append('VideoUrl1',       extractVideoUrl(form.shortVideoUrl));
    fd.append('VideoUrl2',       extractVideoUrl(form.fullVideoUrl));
    fd.append('Description',     form.description || '');
    fd.append('Location',        form.location || '');
    fd.append('LocationIframe',  extractVideoUrl(form.mapEmbedSrc));

    // ── Nearby Locations ──
    const appendLoc = (key, dist, unit) => {
        if (dist && String(dist).trim() !== '') {
            fd.append(key, `${dist} ${unit}`);
        } else {
            fd.append(key, '');
        }
    };
    appendLoc('HospitalDistance', form.nearbyHospitalDist, form.nearbyHospitalUnit);
    appendLoc('CollegeDistance', form.nearbyCollegeDist, form.nearbyCollegeUnit);
    appendLoc('SchoolDistance', form.nearbySchoolDist, form.nearbySchoolUnit);
    appendLoc('RailWayStationDistance', form.nearbyStationDist, form.nearbyStationUnit);
    appendLoc('BusStandDistance', form.nearbyBusStandDist, form.nearbyBusStandUnit);

    // Amenity boolean flags — convert camelCase to PascalCase for C# model binding
    Object.entries(amenityFlags).forEach(([field, val]) => {
        const pascalKey = field.charAt(0).toUpperCase() + field.slice(1);
        fd.append(pascalKey, String(val));
    });

    // ── Images ────────────────────────────────────────────────────────────
    // 1) Existing image URLs → semicolon-separated single string (matches DB format)
    const slotValues = IMAGE_SLOT_KEYS.map((_, index) => imageFiles[index] || (Array.isArray(form.images) ? form.images[index] : ''));
    IMAGE_SLOT_KEYS.forEach((key, index) => {
        fd.append(key, getImageSlotValue(slotValues[index]));
    });

    const existingImages = (Array.isArray(form.images) ? form.images : [])
        .slice(0, IMAGE_SLOT_KEYS.length)
        .filter(img => typeof img === 'string' && (img.startsWith('http') || img.startsWith('/')));
    if (existingImages.length > 0) {
        fd.append('ImageUrls', existingImages.map(toStoredImagePath).join(';'));
    }

    // 2) New File objects (compressed uploads)
    imageFiles.filter(Boolean).forEach(file => fd.append('Images', file));

    // ── Debug: log all FormData entries ───────────────────────────────────
    console.group('📦 buildPropertyFormData payload');
    for (const [key, value] of fd.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size}b)` : value);
    }
    console.groupEnd();

    return fd;
}

function getImageName(value) {
    if (!value) return '';
    if (value instanceof File) return value.name;

    if (typeof value === 'string') {
        const clean = value.split('?')[0];
        const parts = clean.split('/').filter(Boolean);
        return parts[parts.length - 1] || clean;
    }

    return '';
}

function getImageSlotValue(value) {
    if (!value) return '';
    if (value instanceof File) return value.name;
    if (typeof value === 'string') return toStoredImagePath(value);
    return '';
}

// ── Status code → user-friendly message ───────────────────────────────────
/**
 * Converts an Axios error into a clean user-facing message.
 *
 * @param {Error} error - Axios error object
 * @returns {string}
 */
export function getErrorMessage(error) {
    if (!error) return 'An unexpected error occurred.';

    // Network / no response
    if (!error.response) {
        return 'Network error. Please check your connection and try again.';
    }

    const status   = error.response.status;
    const data     = error.response.data;
    const serverMsg =
        data?.message || data?.title || data?.error ||
        (typeof data === 'string' ? data : '');

    switch (status) {
        case 400: return serverMsg || 'Invalid request. Please check your inputs.';
        case 401: return 'Unauthorized. Your session has expired — please log in again.';
        case 403: return 'Access denied. You do not have permission to perform this action.';
        case 404: return 'The requested resource was not found.';
        case 409: return serverMsg || 'Conflict — this record may already exist.';
        case 422: return serverMsg || 'Validation failed. Please review your form data.';
        case 500: return 'Server error. Please try again later or contact support.';
        default:  return serverMsg || `Request failed (${status}). Please try again.`;
    }
}
