import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/dashboard');
                if (response.ok) {
                    const b = await response.json();
                    setData({
                        stats: [
                            { title: 'ACTIVE VEHICLES', value: String(b.activeVehicles ?? 0), color: 'primary' },
                            { title: 'AVAILABLE VEHICLES', value: String(b.availableVehicles ?? 0), color: 'success' },
                            { title: 'VEHICLES IN MAINT.', value: String(b.vehiclesInMaintenance ?? 0), color: 'warning' },
                            { title: 'ACTIVE TRIPS', value: String(b.activeTrips ?? 0), color: 'info' },
                            { title: 'FLEET UTILIZATION', value: `${Math.round(b.fleetUtilizationRate || 0)}%`, color: 'success' }
                        ],
                        recentTrips: [
                            { trip: 'TR001', vehicle: 'KA-01-EQ-1001', driver: 'Ramesh Sharma', status: 'Completed', badge: 'bg-success', eta: '—' },
                            { trip: 'TR002', vehicle: 'MH-12-AB-2002', driver: 'Suresh Patil', status: 'Dispatched', badge: 'bg-primary', eta: '45 min' },
                            { trip: 'TR003', vehicle: 'TN-09-CD-4004', driver: 'Amit Verma', status: 'Draft', badge: 'bg-info', eta: 'Pending' },
                        ],
                        vehicleStatuses: [
                            { label: 'Available', percent: Math.round(((b.availableVehicles || 1) / (b.totalVehicles || 1)) * 100), color: 'bg-success' },
                            { label: 'On Trip', percent: Math.round(((b.activeVehicles || 0) / (b.totalVehicles || 1)) * 100), color: 'bg-primary' },
                            { label: 'In Shop', percent: Math.round(((b.vehiclesInMaintenance || 0) / (b.totalVehicles || 1)) * 100), color: 'bg-warning' },
                        ]
                    });
                    setIsLoading(false);
                    return;
                }
            } catch (ignored) {
            }

            setData({
                stats: [
                    { title: 'ACTIVE VEHICLES', value: '53', color: 'primary' },
                    { title: 'AVAILABLE VEHICLES', value: '42', color: 'success' },
                    { title: 'VEHICLES IN MAINT.', value: '05', color: 'warning' },
                    { title: 'ACTIVE TRIPS', value: '18', color: 'info' },
                    { title: 'FLEET UTILIZATION', value: '81%', color: 'success' }
                ],
                recentTrips: [
                    { trip: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', badge: 'bg-primary', eta: '45 min' },
                    { trip: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', badge: 'bg-success', eta: '—' },
                    { trip: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', badge: 'bg-info', eta: '1h 10m' },
                ],
                vehicleStatuses: [
                    { label: 'Available', percent: 70, color: 'bg-success' },
                    { label: 'On Trip', percent: 30, color: 'bg-primary' },
                    { label: 'In Shop', percent: 10, color: 'bg-warning' },
                ]
            });
            setIsLoading(false);
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-vh-100 dashboard-bg d-flex justify-content-center align-items-center text-light">
                <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading core features...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 dashboard-bg d-flex justify-content-center align-items-center text-danger">
                <h4>Error loading dashboard: {error}</h4>
            </div>
        );
    }

    return (
        <div className="container-fluid dashboard-bg text-light min-vh-100">
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

                            const isActive = item === 'Dashboard';

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

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="w-50">
                            <input type="text" className="form-control bg-transparent text-light border-secondary w-50" placeholder="Search..." />
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="me-3 text-secondary text-sm">Raven K. <br /><small className="text-muted">Dispatcher</small></span>
                            <div className="rounded-circle bg-secondary text-center rounded-avatar d-flex justify-content-center align-items-center">
                                RK
                            </div>
                        </div>
                    </div>

                    <div className="row mb-4 flex-nowrap overflow-auto hide-scrollbar">
                        {data.stats.map((stat, idx) => (
                            <div className="col-auto px-2" key={idx} style={{ minWidth: '160px' }}>
                                <div className={`card bg-dark border-secondary border-top-0 border-end-0 border-bottom-0 border-start border-3 border-${stat.color} h-100`}>
                                    <div className="card-body py-2 px-3">
                                        <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>{stat.title}</p>
                                        <h3 className="mb-0">{stat.value}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row">

                        <div className="col-md-8">
                            <h6 className="text-uppercase text-muted mb-3" style={{ letterSpacing: '1px' }}>Recent Trips</h6>
                            <div className="table-responsive">
                                <table className="table table-dark table-hover table-borderless">
                                    <thead className="border-bottom border-secondary text-muted">
                                        <tr style={{ fontSize: '12px' }}>
                                            <th>TRIP</th>
                                            <th>VEHICLE</th>
                                            <th>DRIVER</th>
                                            <th>STATUS</th>
                                            <th>ETA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentTrips.map((trip, idx) => (
                                            <tr key={idx} className="align-middle">
                                                <td>{trip.trip}</td>
                                                <td>{trip.vehicle}</td>
                                                <td>{trip.driver}</td>
                                                <td>
                                                    <span className={`badge ${trip.badge} px-3 py-2 rounded-pill`}>{trip.status}</span>
                                                </td>
                                                <td className="text-muted">{trip.eta}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="col-md-4 pl-md-4">
                            <h6 className="text-uppercase text-muted mb-3" style={{ letterSpacing: '1px' }}>Vehicle Status</h6>
                            {data.vehicleStatuses.map((status, idx) => (
                                <div className="d-flex align-items-center mb-3" key={idx}>
                                    <div className="w-25 text-sm text-secondary">{status.label}</div>
                                    <div className="w-75">
                                        <div className="progress" style={{ height: '8px', backgroundColor: '#333' }}>
                                            <div className={`progress-bar ${status.color}`} role="progressbar" style={{ width: `${status.percent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;