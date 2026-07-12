import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Drivers.css';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/drivers');
                if (response.ok) {
                    const data = await response.json();
                    const mapped = data.map(d => ({
                        id: `D00${d.id || 1}`,
                        name: d.name || 'Unknown',
                        license: d.licenseNumber || 'DL-N/A',
                        expiry: d.licenseExpiryDate || 'N/A',
                        incidents: d.safetyScore < 90 ? 2 : (d.safetyScore < 95 ? 1 : 0),
                        status: d.status === 'ON_TRIP' ? 'On Trip' : (d.status === 'SUSPENDED' ? 'Suspended' : 'Active'),
                        badge: d.status === 'ON_TRIP' ? 'bg-primary' : (d.status === 'SUSPENDED' ? 'bg-danger' : 'bg-success')
                    }));
                    setDrivers(mapped);
                    setIsLoading(false);
                    return;
                }
            } catch (ignored) {}

            setTimeout(() => {
                setDrivers([
                    { id: 'D001', name: 'Alex Mercer', license: 'DL-99382', expiry: '2027-05-12', incidents: 0, status: 'Active', badge: 'bg-success' },
                    { id: 'D002', name: 'Priya Sharma', license: 'DL-44102', expiry: '2024-11-03', incidents: 1, status: 'Active', badge: 'bg-success' },
                    { id: 'D003', name: 'John Doe', license: 'DL-11094', expiry: '2025-01-20', incidents: 3, status: 'Suspended', badge: 'bg-danger' },
                    { id: 'D004', name: 'Sarah Connor', license: 'DL-88210', expiry: '2026-08-15', incidents: 0, status: 'On Leave', badge: 'bg-secondary' },
                ]);
                setIsLoading(false);
            }, 500);
        };

        fetchDrivers();
    }, []);

    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.license.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || driver.status === statusFilter;

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

                            const isActive = item === 'Drivers';

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
                                placeholder="Search Driver Name or License..."
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

                        <button className="btn btn-info rounded-pill px-4 fw-bold shadow-sm text-dark">
                            + Add Driver
                        </button>
                    </div>

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
                                {filteredDrivers.map((driver, idx) => (
                                    <tr key={idx}>
                                        <td className="text-secondary">{driver.id}</td>
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
                                            <span className={`badge ${driver.badge} px-3 py-2 w-75 rounded`} style={{ minWidth: '90px' }}>
                                                {driver.status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-secondary me-2">Profile</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 d-flex gap-3">
                        <span className="badge bg-success px-3 py-2">Active</span>
                        <span className="badge bg-primary px-3 py-2">On Route</span>
                        <span className="badge bg-secondary px-3 py-2">On Leave</span>
                        <span className="badge bg-danger px-3 py-2">Suspended</span>
                    </div>
                    <div className="mt-2">
                        <small className="text-danger" style={{ opacity: 0.8 }}>
                            Rule: Suspended drivers cannot be assigned to new trips.
                        </small>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Drivers;