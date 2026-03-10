import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

const AMENITY_OPTIONS = ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Club House', 'Power Backup', 'Lift', 'Garden', 'Kids Play Area', 'CCTV'];

export default function EditPropertyModal({ property, onClose }) {
    const { updateProperty } = useProperties();
    const [form, setForm] = useState({ ...property });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const toggleAmenity = (a) => {
        setForm(f => {
            const current = f.amenities || [];
            return { ...f, amenities: current.includes(a) ? current.filter(x => x !== a) : [...current, a] };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProperty({ ...form, price: Number(form.price), area: Number(form.area) });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Property</h2>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input className="form-control" name="title" value={form.title || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input className="form-control" name="location" value={form.location || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price (₹)</label>
                                <input className="form-control" type="number" name="price" value={form.price || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Area (sqft)</label>
                                <input className="form-control" type="number" name="area" value={form.area || ''} onChange={handleChange} />
                            </div>
                            {form.type === 'apartment' || form.type === 'villa' || form.type === 'house' ? (
                                <div className="form-group">
                                    <label className="form-label">BHK</label>
                                    <select className="form-control" name="bhk" value={form.bhk || ''} onChange={handleChange}>
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                                    </select>
                                </div>
                            ) : null}
                            {form.type === 'apartment' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Furnishing</label>
                                        <select className="form-control" name="furnishing" value={form.furnishing || ''} onChange={handleChange}>
                                            <option value="Unfurnished">Unfurnished</option>
                                            <option value="Semi-Furnished">Semi-Furnished</option>
                                            <option value="Fully Furnished">Fully Furnished</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Floor No.</label>
                                        <input className="form-control" type="number" name="floor" value={form.floor || ''} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Floors</label>
                                        <input className="form-control" type="number" name="totalFloors" value={form.totalFloors || ''} onChange={handleChange} />
                                    </div>
                                </>
                            )}
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                                    <option value="active">Active</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </div>
                        </div>

                        {(form.type === 'apartment') && (
                            <div className="form-group" style={{ marginTop: 14 }}>
                                <label className="form-label">Amenities</label>
                                <div className="checkbox-group">
                                    {AMENITY_OPTIONS.map(a => (
                                        <label key={a} className="checkbox-item">
                                            <input type="checkbox" checked={(form.amenities || []).includes(a)} onChange={() => toggleAmenity(a)} />
                                            {a}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="form-group" style={{ marginTop: 14 }}>
                            <label className="form-label">Description</label>
                            <textarea className="form-control" name="description" value={form.description || ''} onChange={handleChange} rows={3} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
