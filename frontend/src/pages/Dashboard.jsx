import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Dashboard.css';
import { Link } from 'react-router-dom';
import ComingSoonModal from '../components/ComingSoonModal';
import TopHeader from '../components/TopHeader';
import { dashboardApi, tripApi } from '../services/api';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comingSoonModule, setComingSoonModule] = useState(null);

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [stats, trips] = await Promise.all([
                    dashboardApi.getKPIs(),
                    tripApi.getAll()
                ]);
                
                const activeTripsList = trips.filter(t => t.status === 'DISPATCHED' || t.status === 'IN_TRANSIT');
                const recentTripsList = trips.sort((a,b) => b.id - a.id).slice(0, 5).map(t => ({
                    trip: `TR-${t.id}`,
                    route: `${t.source || t.origin || 'Origin'} → ${t.destination || 'Destination'}`,
                    vehicle: t.vehicleRegistrationNumber || t.vehicle?.registrationNumber || (t.vehicleModel ? `${t.vehicleModel} (#${t.vehicleId})` : `Vehicle #${t.vehicleId}`),
                    driver: t.driverName || t.driver?.name || `Driver #${t.driverId}`,
                    status: t.status === 'DISPATCHED' ? 'In Transit' : (t.status === 'COMPLETED' ? 'Completed' : (t.status === 'DRAFT' ? 'Draft' : t.status)),
                    badge: t.status === 'DISPATCHED' ? 'bg-primary' : (t.status === 'COMPLETED' ? 'bg-success' : (t.status === 'DRAFT' ? 'bg-warning text-dark' : 'bg-info')),
                    eta: t.status === 'DISPATCHED' ? 'In Progress' : (t.status === 'COMPLETED' ? 'Arrived' : 'Pending')
                }));
                
                const totalVehiclesCount = stats.totalVehicles ?? 0;
                setData({
                    stats: [
                        { title: 'FLEET UTILIZATION', value: `${Math.round(stats.fleetUtilization || 0)}%`, color: 'success' },
                        { title: 'ACTIVE VEHICLES', value: String(stats.activeVehicles ?? 0), color: 'primary' },
                        { title: 'AVAILABLE VEHICLES', value: String(stats.availableVehicles ?? 0), color: 'success' },
                        { title: 'VEHICLES IN SHOP', value: String(stats.vehiclesInMaintenance ?? 0), color: 'warning' },
                        { title: 'ACTIVE TRIPS', value: String(stats.activeTrips ?? activeTripsList.length), color: 'info' },
                        { title: 'DRIVERS ON DUTY', value: String(stats.driversOnDuty ?? 0), color: 'primary' }
                    ],
                    recentTrips: recentTripsList,
                    vehicleStatuses: [
                        { label: 'Available', percent: Math.round(((stats.availableVehicles || 0) / (totalVehiclesCount || 1)) * 100) || 0, color: 'bg-success' },
                        { label: 'On Trip', percent: Math.round(((stats.activeVehicles || 0) / (totalVehiclesCount || 1)) * 100) || 0, color: 'bg-primary' },
                        { label: 'In Shop', percent: Math.round(((stats.vehiclesInMaintenance || 0) / (totalVehiclesCount || 1)) * 100) || 0, color: 'bg-warning' },
                    ]
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
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
                            if (item === 'Analytics') path = "/analytics";
                            if (item === 'Settings') path = "/settings";

                            const isActive = item === 'Dashboard';
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

                    <TopHeader />

                    <div className="row g-3 mb-4">
                        {data.stats.map((stat, idx) => (
                            <div className="col-12 col-sm-6 col-md-4 col-xl-2" key={idx}>
                                <div className={`card border-0 border-start border-4 border-${stat.color} h-100 shadow`} style={{ backgroundColor: '#1e242b' }}>
                                    <div className="card-body py-3 px-3">
                                        <p className="text-info mb-1 text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '1px' }}>{stat.title}</p>
                                        <h3 className="mb-0 text-white fw-bolder">{stat.value}</h3>
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
                                        <tr style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                            <th>TRIP</th>
                                            <th>ROUTE</th>
                                            <th>VEHICLE</th>
                                            <th>DRIVER</th>
                                            <th>STATUS</th>
                                            <th>ETA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentTrips.map((trip, idx) => (
                                            <tr key={idx} className="align-middle">
                                                <td className="fw-bold text-info">{trip.trip}</td>
                                                <td className="small text-light">{trip.route}</td>
                                                <td className="text-light">{trip.vehicle}</td>
                                                <td className="text-light">{trip.driver}</td>
                                                <td>
                                                    <span className={`badge ${trip.badge} px-3 py-1 rounded-pill fw-bold`} style={{ fontSize: '11px' }}>{trip.status}</span>
                                                </td>
                                                <td className="text-info fw-bold small">{trip.eta}</td>
                                            </tr>
                                        ))}
                                        {data.recentTrips.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">
                                                    No recent trips logged yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="col-md-4 pl-md-4">
                            <h6 className="text-uppercase text-info mb-3 fw-bold" style={{ letterSpacing: '1px' }}>Vehicle Status</h6>
                            {data.vehicleStatuses.map((status, idx) => (
                                <div className="d-flex align-items-center mb-3" key={idx}>
                                    <div className="w-50 text-white fw-bold small">{status.label} ({status.percent}%)</div>
                                    <div className="w-50">
                                        <div className="progress border border-secondary" style={{ height: '10px', backgroundColor: '#111' }}>
                                            <div className={`progress-bar ${status.color}`} role="progressbar" style={{ width: `${status.percent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
            <ComingSoonModal moduleName={comingSoonModule} onClose={() => setComingSoonModule(null)} />
        </div>
    );
};

export default Dashboard;