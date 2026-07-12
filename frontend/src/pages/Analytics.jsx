import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Analytics.css';

const Analytics = () => {
    const [timeframe, setTimeframe] = useState('30days');
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:8080/api/analytics?timeframe=${timeframe}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setMetrics(data);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Could not load analytics data. Please ensure the backend server is running and CORS is enabled.");
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
                    <h4>Connection Error</h4>
                    <p>{error}</p>
                    <button className="btn btn-outline-danger mt-3" onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (isLoading || !metrics) {
        return (
            <div className="min-vh-100 analytics-bg d-flex justify-content-center align-items-center text-light">
                <div className="spinner-border text-info" role="status"></div>
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

                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                        <h5 className="mb-0 text-white">Reports & Analytics</h5>
                        <div className="d-flex align-items-center gap-3">

                            <select
                                className="form-select form-select-sm bg-transparent text-light border-primary fw-bold"
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                style={{ cursor: 'pointer', width: '150px' }}
                            >
                                <option value="30days">Last 30 Days</option>
                                <option value="quarter">This Quarter</option>
                                <option value="ytd">Year to Date</option>
                            </select>

                            <button className="btn btn-sm btn-outline-secondary text-light">Export PDF</button>
                        </div>
                    </div>

                    <div className="row mb-5">
                        <div className="col-md-3">
                            <div className="card bg-dark border-secondary border-start border-3 border-info h-100 kpi-card">
                                <div className="card-body py-3">
                                    <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Total Distance</p>
                                    <h4 className="mb-0 text-light metric-text">{metrics.totalDistance}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-dark border-secondary border-start border-3 border-success h-100 kpi-card">
                                <div className="card-body py-3">
                                    <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Fuel Consumed</p>
                                    <h4 className="mb-0 text-light metric-text">{metrics.totalFuel}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-dark border-secondary border-start border-3 border-warning h-100 kpi-card">
                                <div className="card-body py-3">
                                    <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Maintenance Cost</p>
                                    <h4 className="mb-0 text-light metric-text">{metrics.maintCost}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-dark border-secondary border-start border-3 border-primary h-100 kpi-card">
                                <div className="card-body py-3">
                                    <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Fleet Utilization</p>
                                    <h4 className="mb-0 text-primary metric-text">{metrics.utilization}</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-7 pe-md-5 border-end border-secondary">
                            <h6 className="text-uppercase text-muted mb-4" style={{ letterSpacing: '1px' }}>Trip Volume Progress</h6>

                            <div className="chart-container d-flex align-items-end justify-content-around border-bottom border-start border-secondary pb-2 ps-2 mt-4" style={{ height: '250px' }}>
                                {metrics.chartData && metrics.chartData.map((data, idx) => (
                                    <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 mx-1">
                                        <div
                                            className="bg-primary rounded-top chart-bar"
                                            style={{ height: `${data.value}%`, width: '100%', maxWidth: '50px', opacity: 0.85 }}
                                            title={`${data.value} Trips`}
                                        ></div>
                                        <span className="text-muted small mt-2 text-center" style={{ fontSize: '11px' }}>{data.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-md-5 ps-md-5">
                            <h6 className="text-uppercase text-muted mb-4" style={{ letterSpacing: '1px' }}>Current Fleet Status</h6>

                            <div className="mt-4">
                                {metrics.fleetStatus && metrics.fleetStatus.map((status, idx) => (
                                    <div className="mb-4" key={idx}>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-light small">{status.label}</span>
                                            <span className="text-muted small">{status.percent}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '10px', backgroundColor: '#333' }}>
                                            <div className={`progress-bar ${status.color}`} role="progressbar" style={{ width: `${status.percent}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {metrics.insight && (
                                <div className="card bg-dark border-secondary mt-5 insight-box transition-all">
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="fs-4">💡</div>
                                            <div>
                                                <h6 className="mb-1 text-light">AI Insight</h6>
                                                <small className="text-muted">{metrics.insight}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Analytics;