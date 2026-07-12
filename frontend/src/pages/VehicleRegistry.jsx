import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/VehicleRegistry.css';
import { Link } from 'react-router-dom';

const VehicleRegistry = () => {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    const [showAddForm, setShowAddForm] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        regNo: '', makeModel: '', type: 'Truck', capacity: '5000 kg', odometer: '0', cost: '1500000'
    });

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        if (!newVehicle.regNo || !newVehicle.makeModel) return;
        try {
            const res = await fetch('http://localhost:8080/api/vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    registrationNumber: newVehicle.regNo,
                    model: newVehicle.makeModel,
                    type: newVehicle.type,
                    maxLoadCapacity: parseFloat(newVehicle.capacity) || 5000,
                    odometer: parseFloat(newVehicle.odometer) || 0,
                    acquisitionCost: parseFloat(newVehicle.cost) || 1500000,
                    status: 'AVAILABLE'
                })
            });
            if (res.ok) {
                const saved = await res.json();
                setVehicles(prev => [{
                    regNo: saved.registrationNumber,
                    makeModel: saved.model,
                    type: saved.type,
                    capacity: `${saved.maxLoadCapacity} kg`,
                    odometer: `${saved.odometer} km`,
                    cost: `₹${saved.acquisitionCost}`,
                    status: 'Available',
                    badge: 'bg-success'
                }, ...prev]);
                setShowAddForm(false);
                setNewVehicle({ regNo: '', makeModel: '', type: 'Truck', capacity: '5000 kg', odometer: '0', cost: '1500000' });
                return;
            }
        } catch (ignored) {}
        setVehicles(prev => [{
            regNo: newVehicle.regNo,
            makeModel: newVehicle.makeModel,
            type: newVehicle.type,
            capacity: newVehicle.capacity,
            odometer: `${newVehicle.odometer} km`,
            cost: `₹${newVehicle.cost}`,
            status: 'Available',
            badge: 'bg-success'
        }, ...prev]);
        setShowAddForm(false);
        setNewVehicle({ regNo: '', makeModel: '', type: 'Truck', capacity: '5000 kg', odometer: '0', cost: '1500000' });
    };

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/vehicles');
                if (response.ok) {
                    const data = await response.json();
                    const mapped = data.map(v => ({
                        regNo: v.registrationNumber || 'N/A',
                        makeModel: v.model || 'Unknown',
                        type: v.type || 'Truck',
                        capacity: `${v.maxLoadCapacity || 0} kg`,
                        odometer: `${v.odometer || 0} km`,
                        cost: `₹${v.acquisitionCost || 0}`,
                        status: v.status === 'ON_TRIP' ? 'On Trip' : (v.status === 'IN_SHOP' ? 'In Shop' : (v.status === 'RETIRED' ? 'Retired' : 'Available')),
                        badge: v.status === 'ON_TRIP' ? 'bg-primary' : (v.status === 'IN_SHOP' ? 'bg-warning text-dark' : (v.status === 'RETIRED' ? 'bg-danger' : 'bg-success'))
                    }));
                    setVehicles(mapped);
                    setIsLoading(false);
                    return;
                }
            } catch (ignored) {}

            setTimeout(() => {
                setVehicles([
                    { regNo: 'GJ01AB452', makeModel: 'VAN-05', type: 'Van', capacity: '500 kg', odometer: '74,000', cost: '6,20,000', status: 'Available', badge: 'bg-success' },
                    { regNo: 'GJ01AB998', makeModel: 'TRUCK-11', type: 'Truck', capacity: '5 Ton', odometer: '182,000', cost: '24,50,000', status: 'On Trip', badge: 'bg-primary' },
                    { regNo: 'GJ01AB1120', makeModel: 'MINI-03', type: 'Mini', capacity: '1 Ton', odometer: '66,000', cost: '4,10,000', status: 'In Shop', badge: 'bg-warning text-dark' },
                    { regNo: 'GJ01AB009', makeModel: 'VAN-09', type: 'Van', capacity: '750 kg', odometer: '241,900', cost: '5,90,000', status: 'Retired', badge: 'bg-danger' },
                ]);
                setIsLoading(false);
            }, 500);
        };

        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch = vehicle.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.makeModel.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || vehicle.type === typeFilter;
        const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const uniqueTypes = ['All', ...new Set(vehicles.map(v => v.type))];
    const uniqueStatuses = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];

    if (isLoading) {
        return (
            <div className="min-vh-100 registry-bg d-flex justify-content-center align-items-center text-light">
                <div className="spinner-border text-warning" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid registry-bg text-light min-vh-100">
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
                            const isActive = item === 'Fleet';

                            return (
                                <li className="nav-item w-100" key={index}>
                                    <Link
                                        to={path}
                                        className={`nav-link px-4 py-2 ${isActive ? 'active-nav-item' : 'text-secondary hover-nav'}`}
                                    >
                                        {item}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="col-md-10 p-4">

                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                        <div className="w-50">
                            <input
                                type="text"
                                className="form-control bg-transparent text-light border-secondary w-50"
                                placeholder="Search Reg No. or Make..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="me-3 text-secondary text-sm text-end">Raven K. <br /><small className="text-muted">Dispatcher</small></span>
                            <div className="rounded-circle bg-secondary text-center rounded-avatar d-flex justify-content-center align-items-center">
                                RK
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <label className="text-muted small mb-0">Type:</label>
                                <select
                                    className="form-select form-select-sm bg-transparent text-light border-secondary w-auto"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <label className="text-muted small mb-0">Status:</label>
                                <select
                                    className="form-select form-select-sm bg-transparent text-light border-secondary w-auto"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <button className="btn btn-primary btn-sm fw-bold px-3 rounded-pill" onClick={() => setShowAddForm(!showAddForm)}>
                                {showAddForm ? '✕ Cancel' : '+ Add New Vehicle'}
                            </button>
                        </div>
                    </div>

                    {showAddForm && (
                        <div className="card bg-dark border border-secondary p-3 mb-4 rounded-3 text-light">
                            <form onSubmit={handleAddVehicle} className="row g-3 align-items-end">
                                <div className="col-md-3">
                                    <label className="form-label small text-secondary">Reg Number</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="e.g. MH-12-AB-9999" value={newVehicle.regNo} onChange={e => setNewVehicle({...newVehicle, regNo: e.target.value})} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small text-secondary">Make / Model</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="e.g. Volvo FH16" value={newVehicle.makeModel} onChange={e => setNewVehicle({...newVehicle, makeModel: e.target.value})} required />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small text-secondary">Type</label>
                                    <select className="form-select form-select-sm" value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}>
                                        <option value="Truck">Truck</option>
                                        <option value="Van">Van</option>
                                        <option value="Mini">Mini</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small text-secondary">Capacity</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="5000 kg" value={newVehicle.capacity} onChange={e => setNewVehicle({...newVehicle, capacity: e.target.value})} />
                                </div>
                                <div className="col-md-2">
                                    <button type="submit" className="btn btn-success btn-sm w-100 fw-bold">Save Vehicle</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-dark table-hover table-borderless align-middle">
                            <thead className="border-bottom border-secondary text-muted">
                                <tr style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                    <th className="text-uppercase fw-normal pb-3">REG. NO. (UNIQUE)</th>
                                    <th className="text-uppercase fw-normal pb-3">MAKE/MODEL</th>
                                    <th className="text-uppercase fw-normal pb-3">TYPE</th>
                                    <th className="text-uppercase fw-normal pb-3">CAPACITY</th>
                                    <th className="text-uppercase fw-normal pb-3">ODOMETER</th>
                                    <th className="text-uppercase fw-normal pb-3">ACQ. COST</th>
                                    <th className="text-uppercase fw-normal pb-3">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.length > 0 ? (
                                    filteredVehicles.map((vehicle, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold">{vehicle.regNo}</td>
                                            <td>{vehicle.makeModel}</td>
                                            <td className="text-secondary">{vehicle.type}</td>
                                            <td className="text-secondary">{vehicle.capacity}</td>
                                            <td>{vehicle.odometer}</td>
                                            <td>{vehicle.cost}</td>
                                            <td>
                                                <span className={`badge ${vehicle.badge} px-3 py-2 w-75 rounded`} style={{ minWidth: '90px' }}>
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            No vehicles match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        <small className="text-warning" style={{ opacity: 0.8 }}>
                            Rule: Registration No. must be unique - Retired/In Shop vehicles are hidden from Trip Dispatcher
                        </small>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default VehicleRegistry;