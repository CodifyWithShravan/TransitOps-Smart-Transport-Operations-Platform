import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Maintenance.css';
import ComingSoonModal from '../components/ComingSoonModal';
import { vehicleApi, maintenanceApi } from '../services/api';

const Maintenance = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [comingSoonModule, setComingSoonModule] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);

    const [formData, setFormData] = useState({
        vehicleId: '',
        serviceType: '',
        cost: '',
        notes: '',
        status: 'In Shop'
    });

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    const fetchVehiclesAndLogs = async () => {
        try {
            const [vData, mData] = await Promise.all([
                vehicleApi.getAll(),
                maintenanceApi.getAll()
            ]);
            
            const vehicleList = vData.map(v => ({
                id: String(v.id),
                make: v.model || 'Vehicle',
                reg: v.registrationNumber || ''
            }));
            
            const mappedLogs = mData.map(m => {
                const reg = m.vehicle ? m.vehicle.registrationNumber : 'Unknown';
                return {
                    id: m.id,
                    vehicleReg: reg,
                    type: m.description || 'General Maintenance',
                    cost: m.cost || 0,
                    date: m.startDate ? m.startDate.split('T')[0] : 'N/A',
                    status: m.status === 'OPEN' ? 'In Shop' : 'Completed',
                    badge: m.status === 'OPEN' ? 'bg-warning text-dark' : 'bg-success'
                };
            });
            
            setVehicles(vehicleList);
            setMaintenanceLogs(mappedLogs.sort((a,b) => b.id - a.id));
        } catch (error) {
            console.error("Failed to load maintenance data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVehiclesAndLogs();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
        if (!selectedVehicle) return;

        try {
            await maintenanceApi.create({
                vehicleId: Number(selectedVehicle.id),
                description: formData.serviceType || 'Routine Maintenance',
                cost: parseInt(formData.cost) || 0,
                maintenanceType: 'ROUTINE',
                status: 'OPEN'
            });
            
            fetchVehiclesAndLogs();
            setFormData({ vehicleId: '', serviceType: '', cost: '', notes: '', status: 'In Shop' });
        } catch (error) {
            alert(`Failed to log maintenance: ${error.message}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-vh-100 maintenance-bg d-flex justify-content-center align-items-center text-light">
                <div className="spinner-border text-warning" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid maintenance-bg text-light min-vh-100">
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

                            const isActive = item === 'Maintenance';
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

                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                        <h5 className="mb-0 text-white">Maintenance</h5>
                        <div className="d-flex align-items-center">
                            <span className="me-3 text-secondary text-sm text-end">Raven K. <br /><small className="text-muted">Dispatcher</small></span>
                            <div className="rounded-circle bg-secondary text-center rounded-avatar d-flex justify-content-center align-items-center">RK</div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 pe-md-4 border-end border-secondary">
                            <h6 className="text-uppercase text-muted mb-4" style={{ letterSpacing: '1px' }}>Log Service Record</h6>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small mb-1">Select Vehicle</label>
                                    <select name="vehicleId" required className="form-select bg-transparent text-light border-secondary" value={formData.vehicleId} onChange={handleInputChange}>
                                        <option value="">Choose...</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.reg} ({v.make})</option>)}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small mb-1">Service Type</label>
                                    <select name="serviceType" required className="form-select bg-transparent text-light border-secondary" value={formData.serviceType} onChange={handleInputChange}>
                                        <option value="">Choose...</option>
                                        <option value="Oil Change">Oil Change</option>
                                        <option value="Brake Inspection">Brake Inspection</option>
                                        <option value="Tire Replacement">Tire Replacement</option>
                                        <option value="Engine Repair">Engine Repair</option>
                                        <option value="General Service">General Service</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small mb-1">Estimated Cost (₹)</label>
                                    <input type="number" name="cost" required className="form-control bg-transparent text-light border-secondary" placeholder="0" value={formData.cost} onChange={handleInputChange} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-secondary small mb-1">Status</label>
                                    <select name="status" className="form-select bg-transparent text-light border-secondary" value={formData.status} onChange={handleInputChange}>
                                        <option value="In Shop">In Shop (Active)</option>
                                        <option value="Scheduled">Scheduled (Future)</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-secondary small mb-1">Technician Notes</label>
                                    <textarea name="notes" className="form-control bg-transparent text-light border-secondary" rows="3" placeholder="Add any specific details here..." value={formData.notes} onChange={handleInputChange}></textarea>
                                </div>

                                <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill text-dark">
                                    + Log Maintenance
                                </button>
                            </form>
                        </div>

                        <div className="col-md-8 ps-md-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="text-uppercase text-muted mb-0" style={{ letterSpacing: '1px' }}>Service History & Active Jobs</h6>
                                <input type="text" className="form-control form-control-sm bg-transparent text-light border-secondary w-25" placeholder="Search logs..." />
                            </div>

                            <div className="table-responsive">
                                <table className="table table-dark table-hover table-borderless align-middle">
                                    <thead className="border-bottom border-secondary text-muted">
                                        <tr style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                            <th className="text-uppercase fw-normal pb-3">TICKET ID</th>
                                            <th className="text-uppercase fw-normal pb-3">VEHICLE</th>
                                            <th className="text-uppercase fw-normal pb-3">SERVICE TYPE</th>
                                            <th className="text-uppercase fw-normal pb-3">DATE</th>
                                            <th className="text-uppercase fw-normal pb-3">COST</th>
                                            <th className="text-uppercase fw-normal pb-3">STATUS</th>
                                            <th className="text-uppercase fw-normal pb-3 text-end">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maintenanceLogs.length > 0 ? (
                                            maintenanceLogs.map((log, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-secondary">{log.id}</td>
                                                    <td className="fw-semibold">{log.vehicleReg}</td>
                                                    <td>{log.type}</td>
                                                    <td className="text-secondary">{log.date}</td>
                                                    <td>₹{log.cost.toLocaleString('en-IN')}</td>
                                                    <td>
                                                        <span className={`badge ${log.status === 'Completed' ? 'bg-success' : log.badge} px-3 py-2 rounded`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        {log.status === 'In Shop' ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-success fw-bold"
                                                                onClick={async () => {
                                                                    try {
                                                                        await maintenanceApi.complete(log.id, { notes: 'Completed' });
                                                                        fetchVehiclesAndLogs();
                                                                        alert(`✅ Maintenance Completed!\n\nVehicle ${log.vehicleReg} is now released from shop and marked Available.`);
                                                                    } catch (error) {
                                                                        alert(`Failed to complete maintenance: ${error.message}`);
                                                                    }
                                                                }}
                                                            >
                                                                Release to Available
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted small">Completed</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5 text-muted">
                                                    No maintenance records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-3">
                                <small className="text-warning" style={{ opacity: 0.8 }}>
                                    Rule: Vehicles marked as "In Shop" are automatically removed from the Trip Dispatcher available list.
                                </small>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            <ComingSoonModal moduleName={comingSoonModule} onClose={() => setComingSoonModule(null)} />
        </div>
    );
};

export default Maintenance;