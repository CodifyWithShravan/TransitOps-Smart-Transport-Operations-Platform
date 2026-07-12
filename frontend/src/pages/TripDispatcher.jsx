import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/TripDispatcher.css';
import ComingSoonModal from '../components/ComingSoonModal';
import { vehicleApi, driverApi, tripApi } from '../services/api';

const TripDispatcher = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [comingSoonModule, setComingSoonModule] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [activeTrips, setActiveTrips] = useState([]);

    const [formData, setFormData] = useState({
        vehicleId: '',
        driverId: '',
        origin: '',
        destination: '',
        cargoWeight: '',
        status: 'Draft'
    });

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    const [dispatchMessage, setDispatchMessage] = useState(null);

    const fetchDropdowns = async () => {
        try {
            const [vData, dData, tData] = await Promise.all([
                vehicleApi.getAll('AVAILABLE'),
                driverApi.getAll('AVAILABLE'),
                tripApi.getAll()
            ]);
            
            const vehicleList = vData.map(v => ({ id: String(v.id), make: v.model || 'Vehicle', capacity: v.maxLoadCapacity || 1000, reg: v.registrationNumber || '' }));
            const driverList = dData.map(d => ({ id: String(d.id), name: d.name || 'Driver' }));
            
            setVehicles(vehicleList);
            setDrivers(driverList);
            setActiveTrips(tData.sort((a,b) => b.id - a.id)); // sort newest first
        } catch (error) {
            console.error("Failed to load dispatcher data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const handleDispatch = async () => {
        try {
            const tripPayload = {
                vehicleId: Number(formData.vehicleId),
                driverId: Number(formData.driverId),
                origin: formData.origin || 'Warehouse A',
                destination: formData.destination || 'Hub B',
                cargoWeightKg: Number(formData.cargoWeight) || 500
            };
            
            // Backend should atomically create the trip and lock the vehicle and driver
            const newTrip = await tripApi.create(tripPayload);
            await tripApi.dispatch(newTrip.id);

            setDispatchMessage(`✅ Trip #${newTrip.id} dispatched! (${newTrip.origin} → ${newTrip.destination})`);
            setFormData({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', status: 'Draft' });
            setTimeout(() => setDispatchMessage(null), 4000);
            
            // Refresh lists from backend to ensure data integrity
            fetchDropdowns();
        } catch (error) {
            alert(`Failed to dispatch trip: ${error.message}`);
        }
    };

    const handleCompleteTrip = async (tripId) => {
        try {
            await tripApi.complete(tripId);
            // Refresh lists from backend
            fetchDropdowns();
        } catch (error) {
            alert(`Failed to complete trip: ${error.message}`);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    const currentWeight = parseInt(formData.cargoWeight) || 0;
    const isOverCapacity = selectedVehicle && currentWeight > selectedVehicle.capacity;
    const capacityDeficit = isOverCapacity ? currentWeight - selectedVehicle.capacity : 0;

    const inTransitCount = activeTrips.filter(t => t.status === 'DISPATCHED' || t.status === 'IN_TRANSIT').length;
    const completedCount = activeTrips.filter(t => t.status === 'COMPLETED').length;

    if (isLoading) {
        return (
            <div className="min-vh-100 dispatcher-bg d-flex justify-content-center align-items-center text-light">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid dispatcher-bg text-light min-vh-100">
            <div className="row h-100">

                <div className="col-md-2 sidebar-dark p-0 d-flex flex-column border-end border-secondary">
                    <div className="p-4 border-bottom border-secondary">
                        <h4 className="mb-0 text-white">TransitOps</h4>
                    </div>
                    <ul className="nav flex-column mt-3 w-100">
                        {navItems.map((item, index) => {
                            let path = "/";
                            if (item === 'Fleet') path = "/fleet";
                            if (item === 'Drivers') path = "/drivers";
                            if (item === 'Trips') path = "/trips";
                            if (item === 'Maintenance') path = "/maintenance";

                            const isActive = item === 'Trips';
                            const isComingSoon = item === 'Fuel & Expenses' || item === 'Analytics' || item === 'Settings';

                            return (
                                <li className="nav-item w-100" key={index}>
                                    {isComingSoon ? (
                                        <button
                                            type="button"
                                            onClick={() => setComingSoonModule(item)}
                                            className="nav-link px-4 py-2 text-secondary hover-nav bg-transparent border-0 w-100 text-start"
                                        >
                                            {item}
                                        </button>
                                    ) : (
                                        <Link to={path} className={`nav-link px-4 py-2 ${isActive ? 'active-nav-item' : 'text-secondary hover-nav'}`}>
                                            {item}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="col-md-10 p-4">

                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                        <h5 className="mb-0 text-white">Trip Dispatcher</h5>
                        <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-info text-dark px-3 py-2 fw-bold">{inTransitCount} In Transit</span>
                            <span className="badge bg-success px-3 py-2 fw-bold">{completedCount} Completed</span>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-5 pe-md-5 border-end border-secondary">
                            <h6 className="text-uppercase text-muted mb-4" style={{ letterSpacing: '1px' }}>New Trip Details</h6>

                            <form>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small mb-1">Assign Vehicle</label>
                                    <select name="vehicleId" className="form-select bg-dark text-light border-secondary" value={formData.vehicleId} onChange={handleInputChange}>
                                        <option value="">Select an available vehicle...</option>
                                        {vehicles.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {v.make} ({v.capacity}kg) - {v.reg} ✅
                                                </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small mb-1">Assign Driver</label>
                                    <select name="driverId" className="form-select bg-dark text-light border-secondary" value={formData.driverId} onChange={handleInputChange}>
                                        <option value="">Select an active driver...</option>
                                        {drivers.map(d => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name} ✅
                                                </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label text-secondary small mb-1">Origin</label>
                                        <input type="text" name="origin" className="form-control bg-transparent text-light border-secondary" placeholder="e.g. Warehouse A" value={formData.origin} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-secondary small mb-1">Destination</label>
                                        <input type="text" name="destination" className="form-control bg-transparent text-light border-secondary" placeholder="e.g. Sector 7" value={formData.destination} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-secondary small mb-1">Cargo Weight (kg)</label>
                                    <input type="number" name="cargoWeight" className={`form-control bg-transparent text-light ${isOverCapacity ? 'border-danger' : 'border-secondary'}`} placeholder="Enter weight in kg" value={formData.cargoWeight} onChange={handleInputChange} />
                                </div>

                                {isOverCapacity && (
                                    <div className="alert alert-dark border border-danger text-danger mb-4 rounded-3 bg-opacity-10 d-flex align-items-center">
                                        <div className="me-3 fs-4">⚠️</div>
                                        <div>
                                            <strong>Capacity Exceeded by {capacityDeficit} kg.</strong><br />
                                            <small>Please select a larger vehicle or reduce cargo weight before dispatching.</small>
                                        </div>
                                    </div>
                                )}

                                <button type="button" className="btn btn-primary px-4 rounded-pill w-100 fw-bold py-2" onClick={handleDispatch} disabled={isOverCapacity || !formData.vehicleId || !formData.driverId}>
                                    🚀 Dispatch Trip
                                </button>
                                {dispatchMessage && (
                                    <div className="alert alert-success mt-3 rounded-3 py-2 px-3 small fw-bold">
                                        {dispatchMessage}
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="col-md-7 ps-md-4">
                            <h6 className="text-uppercase text-muted mb-3" style={{ letterSpacing: '1px' }}>Live Dispatched Trips</h6>

                            {activeTrips.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <div style={{ fontSize: '3rem' }}>🚛</div>
                                    <p className="mt-2">No trips dispatched yet. Create a trip on the left to get started.</p>
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                    <table className="table table-dark table-hover table-borderless align-middle">
                                        <thead className="border-bottom border-secondary text-muted position-sticky top-0 bg-dark" style={{ zIndex: 1 }}>
                                            <tr style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                                <th className="text-uppercase fw-normal pb-3">TRIP</th>
                                                <th className="text-uppercase fw-normal pb-3">ROUTE</th>
                                                <th className="text-uppercase fw-normal pb-3">VEHICLE</th>
                                                <th className="text-uppercase fw-normal pb-3">DRIVER</th>
                                                <th className="text-uppercase fw-normal pb-3">STATUS</th>
                                                <th className="text-uppercase fw-normal pb-3 text-end">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeTrips.map((trip, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-bold text-info">TR-{trip.id}</td>
                                                    <td>
                                                        <small className="text-light">{trip.origin}</small>
                                                        <span className="text-primary mx-1">→</span>
                                                        <small className="text-light">{trip.destination}</small>
                                                    </td>
                                                    <td><span className="badge bg-secondary">{trip.vehicle?.model || `Vehicle #${trip.vehicleId}`}</span></td>
                                                    <td className="text-light small">{trip.driver?.name || `Driver #${trip.driverId}`}</td>
                                                    <td>
                                                        <span className={`badge ${trip.status === 'DISPATCHED' ? 'bg-info text-dark' : 'bg-success'} px-2 py-1 rounded-pill fw-bold`} style={{ fontSize: '11px' }}>
                                                            {trip.status === 'DISPATCHED' ? '🚚 In Transit' : (trip.status === 'COMPLETED' ? '✅ Done' : trip.status)}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        {trip.status === 'DISPATCHED' ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-success fw-bold"
                                                                onClick={() => handleCompleteTrip(trip.id)}
                                                            >
                                                                Complete & Release
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted small">Released</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            <ComingSoonModal moduleName={comingSoonModule} onClose={() => setComingSoonModule(null)} />
        </div>
    );
};

export default TripDispatcher;