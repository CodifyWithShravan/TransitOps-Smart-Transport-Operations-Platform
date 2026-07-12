import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Drivers.css';
import ComingSoonModal from '../components/ComingSoonModal';
import TopHeader from '../components/TopHeader';
import { driverApi } from '../services/api';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [comingSoonModule, setComingSoonModule] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    const [showAddDriver, setShowAddDriver] = useState(false);
    const [newDriver, setNewDriver] = useState({ name: '', license: '', expiry: '2028-12-31' });

    const handleAddDriver = async (e) => {
        e.preventDefault();
        if (!newDriver.name || !newDriver.license) return;
        try {
            await driverApi.create({
                name: newDriver.name,
                licenseNumber: newDriver.license,
                licenseCategory: 'Heavy Commercial',
                licenseExpiryDate: newDriver.expiry || '2028-12-31',
                contact: '+91-9999999999',
                safetyScore: 100.0,
                status: 'AVAILABLE'
            });
            
            setShowAddDriver(false);
            setNewDriver({ name: '', license: '', expiry: '2028-12-31' });
            fetchDrivers();
        } catch (error) {
            alert(`Failed to add driver: ${error.message}`);
        }
    };

    const fetchDrivers = async () => {
        try {
            const data = await driverApi.getAll();
            const mapped = data.map(d => ({
                id: d.id,
                name: d.name || 'Unknown',
                license: d.licenseNumber || 'DL-N/A',
                expiry: d.licenseExpiryDate || 'N/A',
                incidents: d.safetyScore < 90 ? 2 : (d.safetyScore < 95 ? 1 : 0),
                status: d.status === 'ON_TRIP' ? 'On Trip' : (d.status === 'SUSPENDED' ? 'Suspended' : 'Active')
            }));
            setDrivers(mapped.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Failed to fetch drivers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const filteredDrivers = drivers.filter(driver => {
        const liveStatus = driver.status;
        const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.license.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || liveStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="min-vh-100 driver-bg d-flex justify-content-center align-items-center text-light">
                <div className="spinner-border text-info" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid driver-bg text-light min-vh-100">
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
                            if (item === 'Fuel & Expenses') path = "/fuel";
                            if (item === 'Analytics') path = "/analytics";
                            if (item === 'Settings') path = "/settings";

                            const isActive = item === 'Drivers';
                            const isComingSoon = false;

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
                                        <Link
                                            to={path}
                                            className={`nav-link px-4 py-2 ${isActive ? 'active-nav-item' : 'text-secondary hover-nav'}`}
                                        >
                                            {item}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="col-md-10 p-4">

                    <TopHeader
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Search Driver Name or License..."
                    />

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <label className="text-muted small mb-0">Status:</label>
                            <select
                                className="form-select form-select-sm bg-transparent text-light border-secondary w-auto"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Drivers</option>
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>

                        <button className="btn btn-info rounded-pill px-4 fw-bold shadow-sm text-dark" onClick={() => setShowAddDriver(!showAddDriver)}>
                            {showAddDriver ? '✕ Cancel' : '+ Add Driver'}
                        </button>
                    </div>

                    {showAddDriver && (
                        <div className="card bg-dark border border-secondary p-3 mb-4 rounded-3 text-light">
                            <form onSubmit={handleAddDriver} className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label small text-secondary">Driver Full Name</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="e.g. Vikram Rathore" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small text-secondary">License Number</label>
                                    <input type="text" className="form-control form-control-sm" placeholder="e.g. DL-11223344" value={newDriver.license} onChange={e => setNewDriver({...newDriver, license: e.target.value})} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small text-secondary">License Expiry</label>
                                    <input type="date" className="form-control form-control-sm" value={newDriver.expiry} onChange={e => setNewDriver({...newDriver, expiry: e.target.value})} />
                                </div>
                                <div className="col-md-2">
                                    <button type="submit" className="btn btn-success btn-sm w-100 fw-bold">Save Driver</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-dark table-hover table-borderless align-middle">
                            <thead className="border-bottom border-secondary text-muted">
                                <tr style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                    <th className="text-uppercase fw-normal pb-3">ID</th>
                                    <th className="text-uppercase fw-normal pb-3">NAME</th>
                                    <th className="text-uppercase fw-normal pb-3">LICENSE NO.</th>
                                    <th className="text-uppercase fw-normal pb-3">EXPIRY DATE</th>
                                    <th className="text-uppercase fw-normal pb-3">INCIDENTS</th>
                                    <th className="text-uppercase fw-normal pb-3">STATUS</th>
                                    <th className="text-uppercase fw-normal pb-3 text-end">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDrivers.map((driver, idx) => {
                                    const liveStatus = driver.status;
                                    const badgeColor = liveStatus === 'Active' ? 'bg-success' : (liveStatus === 'On Route' ? 'bg-primary' : 'bg-warning text-dark');
                                    return (
                                        <tr key={idx}>
                                            <td className="text-secondary">D00{driver.id}</td>
                                            <td className="fw-semibold">{driver.name}</td>
                                            <td>{driver.license}</td>
                                            <td className={new Date(driver.expiry) < new Date() ? 'text-danger' : ''}>
                                                {driver.expiry}
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill ${driver.incidents > 0 ? 'bg-danger' : 'bg-secondary'}`}>
                                                    {driver.incidents}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${badgeColor} px-3 py-2 rounded`} style={{ minWidth: '90px' }}>
                                                    {liveStatus}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-secondary">Profile</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredDrivers.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            No drivers match your search filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-secondary border-opacity-25 small text-muted">
                        <div className="d-flex align-items-center gap-3">
                            <span>Legend:</span>
                            <span className="badge bg-success px-2 py-1">Active</span>
                            <span className="badge bg-primary px-2 py-1">On Route / On Trip</span>
                            <span className="badge bg-warning text-dark px-2 py-1">On Leave</span>
                        </div>
                        <span className="text-secondary fst-italic">
                            ℹ️ Driver statuses update automatically when assigned or released from trips.
                        </span>
                    </div>

                </div>
            </div>
            <ComingSoonModal moduleName={comingSoonModule} onClose={() => setComingSoonModule(null)} />
        </div>
    );
};

export default Drivers;