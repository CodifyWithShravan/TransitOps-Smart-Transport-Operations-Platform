import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopHeader from '../components/TopHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Analytics.css';
import { dashboardApi, tripApi, vehicleApi, fuelApi, expenseApi } from '../services/api';

const Analytics = () => {
    const [timeframe, setTimeframe] = useState('30days');
    const [metrics, setMetrics] = useState(null);
    const [vehicleAnalytics, setVehicleAnalytics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [stats, trips, vehicles, fuels, expenses, vehAnalytics] = await Promise.all([
                    dashboardApi.getKPIs().catch(() => ({})),
                    tripApi.getAll().catch(() => []),
                    vehicleApi.getAll().catch(() => []),
                    fuelApi.getAll().catch(() => []),
                    expenseApi.getAll().catch(() => []),
                    dashboardApi.getVehicleAnalytics().catch(() => [])
                ]);

                const tripList = Array.isArray(trips) ? trips : [];
                const vehList = Array.isArray(vehicles) ? vehicles : [];
                const fuelList = Array.isArray(fuels) ? fuels : [];
                const expList = Array.isArray(expenses) ? expenses : [];
                const vAnalyticsList = Array.isArray(vehAnalytics) ? vehAnalytics : [];

                // 1. Dynamic Total Distance
                const totalDist = tripList.reduce((acc, t) => acc + (Number(t.plannedDistance) || 0), 0);

                // 2. Dynamic Fuel & Operational Costs
                const fuelCostSum = fuelList.reduce((acc, f) => acc + (Number(f.cost) || 0), 0);
                const expenseCostSum = expList.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
                const totalFuelCost = fuelCostSum > 0 ? fuelCostSum : Number(stats.totalFuelCost || 0);

                // 3. Dynamic Maintenance & Repairs
                const maintCostSum = expList
                    .filter(e => e.category === 'MAINTENANCE')
                    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
                const totalMaintCost = maintCostSum > 0 ? maintCostSum : Number(stats.totalMaintenanceCost || 0);

                // 4. Dynamic Fleet Utilization Rate
                const totalVehiclesCount = vehList.length || stats.totalVehicles || 1;
                const activeVehiclesCount = vehList.filter(v => v.status === 'IN_USE' || v.status === 'ON_TRIP').length || stats.activeVehicles || 0;
                const availableVehiclesCount = vehList.filter(v => v.status === 'AVAILABLE').length || stats.availableVehicles || 0;
                const maintenanceVehiclesCount = vehList.filter(v => v.status === 'UNDER_MAINTENANCE' || v.status === 'MAINTENANCE').length || stats.vehiclesInMaintenance || 0;

                const computedUtilization = Math.round((activeVehiclesCount / totalVehiclesCount) * 100);
                const utilizationRate = stats.fleetUtilization ? Math.round(stats.fleetUtilization) : computedUtilization;

                // 5. Dynamic Daily Trip Volume Grouped by Day of Week from Real Trips
                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

                tripList.forEach(t => {
                    const dateStr = t.scheduledDepartureTime || t.createdAt;
                    if (dateStr) {
                        const dateObj = new Date(dateStr);
                        if (!isNaN(dateObj.getTime())) {
                            const dayName = daysOfWeek[dateObj.getDay()];
                            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
                        }
                    }
                });

                const maxTripsInDay = Math.max(...Object.values(dayCounts), 1);
                const chartBars = daysOfWeek.map(day => ({
                    label: day,
                    count: dayCounts[day],
                    percent: Math.round((dayCounts[day] / maxTripsInDay) * 100)
                }));

                // 6. Dynamic Fleet Status Breakdown
                const getPercent = (val) => Math.round((val / totalVehiclesCount) * 100);

                const costPerKm = totalDist > 0 ? ((totalFuelCost + totalMaintCost + expenseCostSum) / totalDist).toFixed(2) : '0.00';

                setVehicleAnalytics(vAnalyticsList);
                setMetrics({
                    totalDistance: `${totalDist.toLocaleString()} km`,
                    totalFuel: `₹${(totalFuelCost + expenseCostSum).toLocaleString('en-IN')}`,
                    maintCost: `₹${totalMaintCost.toLocaleString('en-IN')}`,
                    utilization: `${utilizationRate}%`,
                    chartData: chartBars,
                    fleetStatus: [
                        { label: 'Available Ready', percent: getPercent(availableVehiclesCount), count: availableVehiclesCount, color: 'bg-success' },
                        { label: 'Active Dispatched', percent: getPercent(activeVehiclesCount), count: activeVehiclesCount, color: 'bg-info' },
                        { label: 'In Shop Maintenance', percent: getPercent(maintenanceVehiclesCount), count: maintenanceVehiclesCount, color: 'bg-warning' }
                    ],
                    insight: `Analytics dynamically calculated from ${tripList.length} real trips across ${totalVehiclesCount} vehicles. Operating cost averages ₹${costPerKm}/km with ${utilizationRate}% fleet utilization.`
                });
            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
                setError(err.message || "Could not load analytics data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [timeframe]);

    if (error) {
        return (
            <div className="min-vh-100 analytics-bg d-flex justify-content-center align-items-center text-danger text-center p-5">
                <div>
                    <div className="fs-1 mb-3">⚠️</div>
                    <h4 className="text-light">Connection Error</h4>
                    <p className="text-light">{error}</p>
                    <button className="btn btn-outline-info mt-3" onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (isLoading || !metrics) {
        return (
            <div className="min-vh-100 analytics-bg d-flex justify-content-center align-items-center text-light">
                <div className="spinner-border text-info me-2" role="status"></div>
                <span>Loading live analytics computed from database...</span>
            </div>
        );
    }

    return (
        <div className="container-fluid analytics-bg text-light min-vh-100">
            <div className="row h-100">

                <div className="col-md-2 sidebar-dark p-0 d-flex flex-column border-end border-secondary position-fixed h-100">
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

                            const isActive = item === 'Analytics';

                            return (
                                <li className="nav-item w-100" key={index}>
                                    <Link to={path} className={`nav-link px-4 py-2 ${isActive ? 'active-nav-item' : 'text-secondary hover-nav'}`}>
                                        {item}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="col-md-10 offset-md-2 p-4">

                    <TopHeader title="Reports & Visual Analytics" />

                    <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                        <div className="d-flex align-items-center gap-2">
                            <label className="text-light small fw-bold mb-0">TIMEFRAME:</label>
                            <select
                                className="form-select form-select-sm bg-dark text-light border-secondary fw-bold"
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                style={{ cursor: 'pointer', width: '160px' }}
                            >
                                <option value="30days" className="bg-dark text-light">Last 30 Days</option>
                                <option value="quarter" className="bg-dark text-light">This Quarter</option>
                                <option value="ytd" className="bg-dark text-light">Year to Date</option>
                            </select>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <a href="http://localhost:8080/api/dashboard/export/vehicles" className="btn btn-sm btn-outline-info text-light fw-semibold" download>Export Fleet CSV</a>
                            <a href="http://localhost:8080/api/dashboard/export/trips" className="btn btn-sm btn-outline-success text-light fw-semibold" download>Export Trips CSV</a>
                            <a href="http://localhost:8080/api/dashboard/export/analytics" className="btn btn-sm btn-outline-warning text-light fw-semibold" download>Export ROI CSV</a>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="row mb-5 g-3">
                        <div className="col-md-3">
                            <div className="card bg-dark border-secondary border-start border-3 border-info h-100 shadow">
                                <div className="card-body py-3">
                                    <p className="text-light fw-bold mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Total Distance</p>
                                    <h3 className="mb-0 text-info fw-bold">{metrics.totalDistance}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-dark border-secondary border-start border-3 border-success h-100 shadow">
                                <div className="card-body py-3">
                                    <p className="text-light fw-bold mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Fuel & Operational Costs</p>
                                    <h3 className="mb-0 text-success fw-bold">{metrics.totalFuel}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-dark border-secondary border-start border-3 border-warning h-100 shadow">
                                <div className="card-body py-3">
                                    <p className="text-light fw-bold mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Maintenance & Repairs</p>
                                    <h3 className="mb-0 text-warning fw-bold">{metrics.maintCost}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-dark border-secondary border-start border-3 border-primary h-100 shadow">
                                <div className="card-body py-3">
                                    <p className="text-light fw-bold mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Fleet Utilization Rate</p>
                                    <h3 className="mb-0 text-light fw-bold">{metrics.utilization}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart and Status Row */}
                    <div className="row g-4 mb-5">
                        <div className="col-md-7">
                            <div className="card bg-dark border-secondary p-4 h-100 shadow">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 className="text-uppercase text-light fw-bold mb-0" style={{ letterSpacing: '1px' }}>
                                        Real-Time Trips Dispatched by Day of Week
                                    </h6>
                                    <span className="badge bg-info text-dark fw-bold">Live DB Aggregation</span>
                                </div>

                                {/* SVG BAR CHART */}
                                <div className="chart-container pt-3" style={{ height: '240px' }}>
                                    <svg viewBox="0 0 500 200" className="w-100 h-100 overflow-visible">
                                        {/* Horizontal grid lines */}
                                        <line x1="0" y1="20" x2="500" y2="20" stroke="#333" strokeDasharray="4" />
                                        <line x1="0" y1="80" x2="500" y2="80" stroke="#333" strokeDasharray="4" />
                                        <line x1="0" y1="140" x2="500" y2="140" stroke="#333" strokeDasharray="4" />
                                        <line x1="0" y1="180" x2="500" y2="180" stroke="#555" />

                                        {metrics.chartData.map((d, idx) => {
                                            const barHeight = Math.max((d.percent / 100) * 140, 6);
                                            const yPos = 180 - barHeight;
                                            const xPos = idx * 68 + 25;
                                            return (
                                                <g key={idx}>
                                                    <rect
                                                        x={xPos}
                                                        y={yPos}
                                                        width="40"
                                                        height={barHeight}
                                                        rx="4"
                                                        fill="url(#barGradient)"
                                                    />
                                                    <text
                                                        x={xPos + 20}
                                                        y={yPos - 8}
                                                        fill="#00E5FF"
                                                        fontSize="12"
                                                        fontWeight="bold"
                                                        textAnchor="middle"
                                                    >
                                                        {d.count} trip{d.count !== 1 ? 's' : ''}
                                                    </text>
                                                    <text
                                                        x={xPos + 20}
                                                        y="196"
                                                        fill="#EEE"
                                                        fontSize="12"
                                                        fontWeight="600"
                                                        textAnchor="middle"
                                                    >
                                                        {d.label}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#00E5FF" />
                                                <stop offset="100%" stopColor="#007791" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5">
                            <div className="card bg-dark border-secondary p-4 h-100 shadow">
                                <h6 className="text-uppercase text-light fw-bold mb-4" style={{ letterSpacing: '1px' }}>
                                    Current Fleet Availability Status
                                </h6>

                                <div className="mt-2">
                                    {metrics.fleetStatus && metrics.fleetStatus.map((status, idx) => (
                                        <div className="mb-4" key={idx}>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="text-light fw-semibold">{status.label}</span>
                                                <span className="text-info fw-bold">{status.count} Vehicles ({status.percent}%)</span>
                                            </div>
                                            <div className="progress" style={{ height: '12px', backgroundColor: '#222' }}>
                                                <div className={`progress-bar ${status.color}`} role="progressbar" style={{ width: `${Math.max(status.percent, 8)}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="card bg-black border-secondary mt-auto p-3 shadow-sm">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="fs-3">💡</div>
                                        <div>
                                            <h6 className="mb-1 text-light fw-bold">AI Fleet Insight (Calculated Live)</h6>
                                            <p className="text-light small mb-0">{metrics.insight}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle-level Analytics Table */}
                    {vehicleAnalytics.length > 0 && (
                        <div className="card bg-dark border-secondary p-4 shadow">
                            <h6 className="text-uppercase text-light fw-bold mb-3" style={{ letterSpacing: '1px' }}>
                                Vehicle-Level Operating Cost & Efficiency Report
                            </h6>
                            <div className="table-responsive">
                                <table className="table table-dark table-hover table-borderless align-middle mb-0">
                                    <thead className="border-bottom border-secondary text-light">
                                        <tr style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                            <th className="text-uppercase fw-semibold pb-3">VEHICLE REG</th>
                                            <th className="text-uppercase fw-semibold pb-3">MODEL / TYPE</th>
                                            <th className="text-uppercase fw-semibold pb-3">TRIPS</th>
                                            <th className="text-uppercase fw-semibold pb-3">DISTANCE</th>
                                            <th className="text-uppercase fw-semibold pb-3">FUEL COST</th>
                                            <th className="text-uppercase fw-semibold pb-3">MAINT COST</th>
                                            <th className="text-uppercase fw-semibold pb-3 text-end">TOTAL OPERATIONAL COST</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicleAnalytics.map((va, i) => (
                                            <tr key={i}>
                                                <td className="fw-bold text-white">{va.registrationNumber}</td>
                                                <td className="text-light">{va.model} ({va.type})</td>
                                                <td className="text-light">{va.completedTrips || 0}</td>
                                                <td className="text-info">{va.totalDistance || 0} km</td>
                                                <td className="text-success">₹{Number(va.totalFuelCost || 0).toLocaleString('en-IN')}</td>
                                                <td className="text-warning">₹{Number(va.totalMaintenanceCost || 0).toLocaleString('en-IN')}</td>
                                                <td className="text-end fw-bold text-white">₹{Number(va.totalOperationalCost || 0).toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Analytics;