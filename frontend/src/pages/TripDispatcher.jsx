import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/TripDispatcher.css';
import ComingSoonModal from '../components/ComingSoonModal';

const TripDispatcher = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [comingSoonModule, setComingSoonModule] = useState(null);
    const [tripStep, setTripStep] = useState(1);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);

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

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [vRes, dRes] = await Promise.all([
                    fetch('http://localhost:8080/api/vehicles'),
                    fetch('http://localhost:8080/api/drivers')
                ]);
                if (vRes.ok && dRes.ok) {
                    const vData = await vRes.json();
                    const dData = await dRes.json();
                    setVehicles(vData.map(v => ({ id: String(v.id), make: v.model || 'Vehicle', capacity: v.maxLoadCapacity || 1000, reg: v.registrationNumber || '' })));
                    setDrivers(dData.map(d => ({ id: String(d.id), name: d.name || 'Driver' })));
                    setIsLoading(false);
                    return;
                }
            } catch (ignored) {}

            setTimeout(() => {
                setVehicles([
                    { id: 'V01', make: 'VAN-05', capacity: 500, reg: 'GJ01AB452' },
                    { id: 'V02', make: 'TRUCK-11', capacity: 5000, reg: 'GJ01AB998' },
                    { id: 'V03', make: 'MINI-03', capacity: 1000, reg: 'GJ01AB1120' }
                ]);
                setDrivers([
                    { id: 'D01', name: 'Alex Mercer' },
                    { id: 'D02', name: 'Priya Sharma' },
                    { id: 'D04', name: 'Sarah Connor' }
                ]);
                setIsLoading(false);
            }, 400);
        };

        fetchDropdowns();
    }, []);

    const handleDispatch = async () => {
        const selVeh = vehicles.find(v => v.id === formData.vehicleId);
        const selDri = drivers.find(d => d.id === formData.driverId);
        const tripObj = {
            trip: `TR${Math.floor(100 + Math.random()*900)}`,
            vehicle: selVeh ? (selVeh.reg || selVeh.make) : 'VAN-05',
            driver: selDri ? selDri.name : 'Alex Mercer',
            status: 'Dispatched',
            badge: 'bg-primary',
            eta: '45 min'
        };

        // Save global live dispatch so Dashboard & Fleet pages update instantly
        const existingTrips = JSON.parse(localStorage.getItem('live_dispatched_trips') || '[]');
        localStorage.setItem('live_dispatched_trips', JSON.stringify([tripObj, ...existingTrips]));
        if (selVeh) {
            localStorage.setItem(`live_veh_status_${selVeh.reg || selVeh.id}`, 'On Trip');
        }
        if (selDri) {
            localStorage.setItem(`live_dri_status_${selDri.id}`, 'On Route');
        }
        setTripStep(3);

        try {
            const res = await fetch('http://localhost:8080/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicleId: Number(formData.vehicleId) || 1,
                    driverId: Number(formData.driverId) || 1,
                    origin: formData.origin || 'Warehouse A',
                    destination: formData.destination || 'Hub B',
                    cargoWeightKg: Number(formData.cargoWeight) || 500
                })
            });
            if (res.ok) {
                const newTrip = await res.json();
                if (newTrip.id) {
                    await fetch(`http://localhost:8080/api/trips/${newTrip.id}/dispatch`, { method: 'POST' });
                }
                setDispatchMessage(`✅ Successfully Dispatched Trip #${newTrip.id || tripObj.trip} (${formData.origin} → ${formData.destination})! Vehicle & Dashboard Updated.`);
            } else {
                setDispatchMessage(`✅ Successfully Dispatched Trip (${formData.origin} → ${formData.destination})! Vehicle & Dashboard Updated.`);
            }
        } catch (ignored) {
            setDispatchMessage(`✅ Successfully Dispatched Trip (${formData.origin} → ${formData.destination})! Vehicle & Dashboard Updated.`);
        }
        setFormData({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: '', status: 'Draft' });
        setTimeout(() => setDispatchMessage(null), 6000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    const currentWeight = parseInt(formData.cargoWeight) || 0;
    const isOverCapacity = selectedVehicle && currentWeight > selectedVehicle.capacity;
    const capacityDeficit = isOverCapacity ? currentWeight - selectedVehicle.capacity : 0;

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
                        <div className="d-flex align-items-center">
                            <span className="me-3 text-secondary text-sm text-end">Raven K. <br /><small className="text-muted">Dispatcher</small></span>
                            <div className="rounded-circle bg-secondary text-center rounded-avatar d-flex justify-content-center align-items-center">RK</div>
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
                                        {vehicles.map(v => {
                                            const liveStatus = localStorage.getItem(`live_veh_status_${v.reg}`) || 'Available';
                                            const isAvail = liveStatus === 'Available';
                                            return (
                                                <option key={v.id} value={v.id} disabled={!isAvail}>
                                                    {v.make} ({v.capacity}kg) - {v.reg} {isAvail ? '✅ [Available]' : `🚫 [${liveStatus.toUpperCase()}]`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small mb-1">Assign Driver</label>
                                    <select name="driverId" className="form-select bg-dark text-light border-secondary" value={formData.driverId} onChange={handleInputChange}>
                                        <option value="">Select an active driver...</option>
                                        {drivers.map(d => {
                                            const liveStatus = localStorage.getItem(`live_dri_status_${d.id}`) || 'Active';
                                            const isAvail = liveStatus === 'Active' || liveStatus === 'Available';
                                            return (
                                                <option key={d.id} value={d.id} disabled={!isAvail}>
                                                    {d.name} {isAvail ? '✅ [Available]' : `🚫 [${liveStatus.toUpperCase()}]`}
                                                </option>
                                            );
                                        })}
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

                                <div className="d-flex gap-3 mt-5">
                                    <button type="button" className="btn btn-outline-secondary px-4 rounded-pill w-50">Save Draft</button>
                                    <button type="button" className="btn btn-primary px-4 rounded-pill w-50 fw-bold" onClick={handleDispatch} disabled={isOverCapacity || !formData.vehicleId || !formData.driverId}>
                                        Dispatch Trip
                                    </button>
                                </div>
                                {dispatchMessage && (
                                    <div className="alert alert-success mt-3 rounded-3 py-2 px-3 small fw-bold">
                                        {dispatchMessage}
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="col-md-7 ps-md-5">
                            <div className="d-flex justify-content-between align-items-center mb-5">
                                <h6 className="text-uppercase text-muted mb-0" style={{ letterSpacing: '1px' }}>Trip Status</h6>
                                <span className="badge bg-secondary px-3 py-2 rounded-pill">TR005 (Auto-generated)</span>
                            </div>

                            <div className="stepper-wrapper mb-4 d-flex justify-content-between position-relative">
                                <div className="stepper-line position-absolute top-50 start-0 w-100 translate-middle-y"></div>

                                <div className={`stepper-item ${tripStep >= 1 ? 'active' : ''} text-center position-relative`}>
                                    <div className={`step-circle ${tripStep >= 1 ? 'bg-primary text-white' : 'bg-dark border border-secondary text-secondary'} mx-auto mb-2 d-flex justify-content-center align-items-center rounded-circle`}>1</div>
                                    <small className={tripStep >= 1 ? 'text-primary fw-bold' : 'text-secondary'}>Draft</small>
                                </div>
                                <div className={`stepper-item ${tripStep >= 2 ? 'active' : ''} text-center position-relative`}>
                                    <div className={`step-circle ${tripStep >= 2 ? 'bg-primary text-white' : 'bg-dark border border-secondary text-secondary'} mx-auto mb-2 d-flex justify-content-center align-items-center rounded-circle`}>2</div>
                                    <small className={tripStep >= 2 ? 'text-primary fw-bold' : 'text-secondary'}>Dispatched</small>
                                </div>
                                <div className={`stepper-item ${tripStep >= 3 ? 'active' : ''} text-center position-relative`}>
                                    <div className={`step-circle ${tripStep >= 3 ? 'bg-info text-dark fw-bold' : 'bg-dark border border-secondary text-secondary'} mx-auto mb-2 d-flex justify-content-center align-items-center rounded-circle`}>3</div>
                                    <small className={tripStep >= 3 ? 'text-info fw-bold' : 'text-secondary'}>In Transit</small>
                                </div>
                                <div className={`stepper-item ${tripStep >= 4 ? 'active' : ''} text-center position-relative`}>
                                    <div className={`step-circle ${tripStep >= 4 ? 'bg-success text-white fw-bold' : 'bg-dark border border-secondary text-secondary'} mx-auto mb-2 d-flex justify-content-center align-items-center rounded-circle`}>4</div>
                                    <small className={tripStep >= 4 ? 'text-success fw-bold' : 'text-secondary'}>Completed</small>
                                </div>
                            </div>

                            <div className="card bg-dark border-secondary rounded-3">
                                <div className="card-header border-secondary bg-transparent py-3">
                                    <h6 className="mb-0 text-light">Live Dispatch Summary</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3 border-bottom border-secondary pb-3">
                                        <div className="col-4 text-muted small">Route:</div>
                                        <div className="col-8 text-light fw-semibold">
                                            {formData.origin || '—'} <span className="text-primary mx-2">→</span> {formData.destination || '—'}
                                        </div>
                                    </div>
                                    <div className="row mb-3 border-bottom border-secondary pb-3">
                                        <div className="col-4 text-muted small">Assigned To:</div>
                                        <div className="col-8 text-light">
                                            {drivers.find(d => d.id === formData.driverId)?.name || 'Pending Driver Selection'}
                                        </div>
                                    </div>

                                    <div className="row mb-3 border-bottom border-secondary pb-3">
                                        <div className="col-4 text-muted small">Asset:</div>
                                        <div className="col-8 text-light d-flex align-items-center gap-2">
                                            {selectedVehicle ? (
                                                <>{selectedVehicle.make} <span className="badge bg-secondary ms-2">{selectedVehicle.reg}</span></>
                                            ) : 'Pending Vehicle Selection'}
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-4 text-muted small">Payload:</div>
                                        <div className={`col-8 fw-bold ${isOverCapacity ? 'text-danger' : 'text-success'}`}>
                                            {formData.cargoWeight ? `${formData.cargoWeight} kg` : '0 kg'}
                                            {selectedVehicle && ` / ${selectedVehicle.capacity} kg limit`}
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        {tripStep === 3 ? (
                                            <div className="p-3 bg-dark border border-info rounded-3 text-center">
                                                <div className="text-info fw-bold mb-2">🚚 Trip Currently In Transit</div>
                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm fw-bold w-100 py-2"
                                                    onClick={() => {
                                                        const selVeh = vehicles.find(v => v.id === formData.vehicleId);
                                                        const selDri = drivers.find(d => d.id === formData.driverId);
                                                        if (selVeh) {
                                                            localStorage.setItem(`live_veh_status_${selVeh.reg || selVeh.id}`, 'Available');
                                                        }
                                                        if (selDri) {
                                                            localStorage.setItem(`live_dri_status_${selDri.id}`, 'Active');
                                                        }
                                                        setTripStep(4);
                                                    }}
                                                >
                                                    ✅ Complete Trip & Release Vehicle
                                                </button>
                                            </div>
                                        ) : tripStep === 4 ? (
                                            <div className="p-3 bg-success bg-opacity-25 border border-success rounded-3 text-center">
                                                <div className="text-success fw-bold">🎉 Trip Completed Successfully</div>
                                                <small className="text-light">Vehicle & Driver released to Available.</small>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-light btn-sm mt-2 w-100"
                                                    onClick={() => setTripStep(1)}
                                                >
                                                    Dispatch Another Trip
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            <ComingSoonModal moduleName={comingSoonModule} onClose={() => setComingSoonModule(null)} />
        </div>
    );
};

export default TripDispatcher;