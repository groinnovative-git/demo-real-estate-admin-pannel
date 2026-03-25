// ── Amenity label ↔ backend boolean field mapping ─────────────────────────

const AMENITY_TO_FIELD = {
    'Swimming Pool':    'hasSwimmingPool',
    'Gym':              'hasGym',
    'Security':         'hasSecurity',
    'Parking':          'hasParking',
    'Club House':       'hasClubHouse',
    'Power Backup':     'hasPowerBackup',
    'Lift':             'hasLift',
    'Garden':           'hasGarden',
    'Kids Play Area':   'hasKidsPlayArea',
    'CCTV':             'hasCCTV',
    'Intercom':         'hasIntercom',
    'Fire Safety':      'hasFireSafety',
    'Water Supply 24x7':'hasWaterSupply24x7',
};

const FIELD_TO_AMENITY = Object.fromEntries(
    Object.entries(AMENITY_TO_FIELD).map(([label, field]) => [field, label])
);

// Frontend type key → backend propertyType string
const TYPE_LABEL_MAP = {
    apartment: 'Apartment',
    villa:     'Villa',
    plot:      'Plot',
    house:     'IndividualHouse',
    commercial:'Commercial',
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

    // For commercial, subType = commercial category; for others, same as type label
    const subType =
        type === 'commercial'
            ? form.commercialType || propertyTypeName
            : propertyTypeName;

    const payload = {
        propertyTitle:      String(form.title || '').trim(),
        price:              Number(form.price) || 0,
        propertyType:       propertyTypeName,
        propertySubType:    subType,
        isLoanProviding:    Boolean(form.loanSupport),
        propertySqFt:       builtSqFt,
        plotAreaSqYd:       Number(form.plotArea) || 0,
        bedrooms:           Number(form.bhk) || 0,
        bathrooms:          Number(form.bathrooms) || 0,
        numberOfFloors:     Number(form.totalFloors) || 0,
        floorNumber:        Number(form.floor) || 0,
        monthlyMaintenance: Number(form.maintenance) || 0,
        washrooms:          Number(form.washrooms) || 0,
        commercialType:     form.commercialType || '',
        isGovApproved:      !!(form.approvalDetails && String(form.approvalDetails).trim()),
        furnishingStatus:   form.furnishing || '',
        facingDirection:    form.facing || '',
        ageOfProperty:      Number(form.ageYears) || 0,
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

    // Reconstruct amenities array from boolean flags
    const amenities = Object.entries(FIELD_TO_AMENITY)
        .filter(([field]) => data[field] === true)
        .map(([, label]) => label);

    return {
        id:             data.propertiesDetailsId || data.id || '',
        title:          data.propertyTitle       || data.title || '',
        price:          Number(data.price)       || 0,
        type:           String(data.propertyType || '').toLowerCase(),
        subType:        data.propertySubType     || '',
        loanSupport:    data.isLoanProviding      || false,
        area:           Number(data.propertySqFt) || 0,
        plotArea:       Number(data.plotAreaSqYd) || 0,
        bhk:            Number(data.bedrooms)     || 0,
        bathrooms:      Number(data.bathrooms)    || 0,
        totalFloors:    Number(data.numberOfFloors)|| 0,
        floor:          Number(data.floorNumber)  || 0,
        maintenance:    Number(data.monthlyMaintenance) || 0,
        washrooms:      Number(data.washrooms)    || 0,
        commercialType: data.commercialType       || '',
        isGovApproved:  data.isGovApproved        || false,
        furnishing:     data.furnishingStatus     || '',
        facing:         data.facingDirection      || '',
        ageYears:       Number(data.ageOfProperty) || 0,
        amenities,
        images:         typeof data.imageUrls === 'string' && data.imageUrls
                            ? data.imageUrls.split(';').filter(Boolean)
                            : Array.isArray(data.imageUrls) ? data.imageUrls
                            : Array.isArray(data.images)    ? data.images
                            : [],
        shortVideoUrl:  data.videoUrl1            || '',
        fullVideoUrl:   data.videoUrl2            || '',
        description:    data.description          || '',
        location:       data.location             || '',
        mapEmbedSrc:    data.locationIframe        || '',
        status:         (data.propertyStatus || data.status || 'active').trim().toLowerCase(),
        isActive:       data.isActive ?? true,
        listedDate:     data.listedDate           || new Date().toISOString().split('T')[0],
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
    const subType = type === 'commercial'
        ? (form.commercialType || propertyTypeName)
        : propertyTypeName;

    const fd = new FormData();

    if (existingId) fd.append('PropertiesDetailsId', existingId);

    fd.append('PropertyTitle',      String(form.title || '').trim());
    fd.append('Price',              String(Number(form.price) || 0));
    fd.append('PropertyType',       propertyTypeName);
    fd.append('PropertySubType',    subType);
    fd.append('IsLoanProviding',    String(Boolean(form.loanSupport)));
    fd.append('PropertyStatus',     form.status === 'sold' ? 'Sold' : 'Active');
    fd.append('PropertySqFt',       String(builtSqFt));
    fd.append('PlotAreaSqYd',       String(Number(form.plotArea) || 0));
    fd.append('Bedrooms',           String(Number(form.bhk) || 0));
    fd.append('Bathrooms',          String(Number(form.bathrooms) || 0));
    fd.append('NumberOfFloors',     String(Number(form.totalFloors) || 0));
    fd.append('FloorNumber',        String(Number(form.floor) || 0));
    fd.append('MonthlyMaintenance', String(Number(form.maintenance) || 0));
    fd.append('Washrooms',          String(Number(form.washrooms) || 0));
    fd.append('CommercialType',     form.commercialType || '');
    fd.append('IsGovApproved',      String(!!(form.approvalDetails && String(form.approvalDetails).trim())));
    fd.append('FurnishingStatus',   form.furnishing || '');
    fd.append('FacingDirection',    form.facing || '');
    fd.append('AgeOfProperty',      String(Number(form.ageYears) || 0));
    fd.append('VideoUrl1',       extractVideoUrl(form.shortVideoUrl));
    fd.append('VideoUrl2',       extractVideoUrl(form.fullVideoUrl));
    fd.append('Description',     form.description || '');
    fd.append('Location',        form.location || '');
    fd.append('LocationIframe',  extractVideoUrl(form.mapEmbedSrc));

    // Amenity boolean flags — convert camelCase to PascalCase for C# model binding
    Object.entries(amenityFlags).forEach(([field, val]) => {
        const pascalKey = field.charAt(0).toUpperCase() + field.slice(1);
        fd.append(pascalKey, String(val));
    });

    // ── Images ────────────────────────────────────────────────────────────
    // 1) Existing image URLs → semicolon-separated single string (matches DB format)
    const existingImages = (Array.isArray(form.images) ? form.images : [])
        .filter(img => typeof img === 'string' && (img.startsWith('http') || img.startsWith('/')));
    if (existingImages.length > 0) {
        fd.append('ImageUrls', existingImages.join(';'));
    }

    // 2) New File objects (compressed uploads)
    imageFiles.forEach(file => fd.append('Images', file));

    // ── Debug: log all FormData entries ───────────────────────────────────
    console.group('📦 buildPropertyFormData payload');
    for (const [key, value] of fd.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size}b)` : value);
    }
    console.groupEnd();

    return fd;
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
