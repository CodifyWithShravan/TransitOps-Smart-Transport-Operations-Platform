import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopHeader from '../components/TopHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/FuelExpenses.css';
import { vehicleApi, fuelApi, expenseApi } from '../services/api';

const FuelExpenses = () => {
    const [vehicles, setVehicles] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        vehicleId: '',
        expenseType: 'Fuel',
        amount: '',
        odometer: '',
        date: new Date().toISOString().split('T')[0]
    });

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [vehRes, fuelRes, expRes] = await Promise.all([
                vehicleApi.getAll(),
                fuelApi.getAll(),
                expenseApi.getAll()
            ]);

            const vehList = Array.isArray(vehRes) ? vehRes : [];
            setVehicles(vehList);

            const fuelLogs = Array.isArray(fuelRes) ? fuelRes.map(f => ({
                id: `FUEL-${f.id}`,
                vehicleReg: f.vehicleRegistrationNumber || `Vehicle #${f.vehicleId}`,
                type: 'Fuel',
                amount: Number(f.cost) || 0,
                odometer: f.odometerReading ? f.odometerReading.toString() : '—',
                date: f.date || new Date().toISOString().split('T')[0],
                badge: 'bg-success'
            })) : [];

            const otherLogs = Array.isArray(expRes) ? expRes.map(e => ({
                id: `EXP-${e.id}`,
                vehicleReg: e.vehicleRegistrationNumber || `Vehicle #${e.vehicleId}`,
                type: e.category ? e.category.charAt(0) + e.category.slice(1).toLowerCase() : 'Other',
                amount: Number(e.amount) || 0,
                odometer: '—',
                date: e.date || new Date().toISOString().split('T')[0],
                badge: 'bg-info text-dark'
            })) : [];

            const combined = [...fuelLogs, ...otherLogs].sort((a, b) => b.date.localeCompare(a.date));
            setExpenses(combined);
        } catch (err) {
            console.error("Error loading fuel & expense data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.vehicleId || !formData.amount) return;

        setIsSubmitting(true);
        try {
            const parsedVehicleId = Number(formData.vehicleId);
            const parsedAmount = Number(formData.amount);
            const parsedOdo = formData.odometer ? Number(formData.odometer) : 0;

            if (formData.expenseType === 'Fuel') {
                await fuelApi.create({
                    vehicleId: parsedVehicleId,
                    litres: Number((parsedAmount / 95).toFixed(2)) || 10,
                    cost: parsedAmount,
                    odometerReading: parsedOdo,
                    date: formData.date
                });
            } else {
                let cat = 'OTHER';
                if (formData.expenseType === 'Toll Tax') cat = 'TOLL';
                if (formData.expenseType === 'Fines') cat = 'PENALTY';

                await expenseApi.create({
                    vehicleId: parsedVehicleId,
                    category: cat,
                    description: `${formData.expenseType} Expense`,
                    amount: parsedAmount,
                    date: formData.date
                });
            }

            setFormData({
                vehicleId: '',
                expenseType: 'Fuel',
                amount: '',
                odometer: '',
                date: new Date().toISOString().split('T')[0]
            });

            await fetchData();
        } catch (err) {
            console.error("Error creating expense log:", err);
            alert("Failed to save expense log to database. Check vehicle selection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalFuel = expenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
    const totalOther = expenses.filter(e => e.type !== 'Fuel').reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="container-fluid fuel-bg text-light min-vh-100">
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

                            const isActive = item === 'Fuel & Expenses';

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

                <div className="col-md-10 p-4">

                    <TopHeader title="Fuel & Expenses" />

                    <div className="row mb-5">
                        <div className="col-md-4">
                            <div className="card bg-dark border-secondary border-start border-3 border-success h-100 shadow">
                                <div className="card-body py-3">
                                    <p className="text-light fw-semibold mb-1 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Total Fuel</p>
                                    <h3 className="mb-0 text-success fw-bold">₹{totalFuel.toLocaleString('en-IN')}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-dark border-secondary border-start border-3 border-info h-100 shadow">
                                <div className="card-body py-3">
                                    <p className="text-light fw-semibold mb-1 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Tolls & Other Expenses</p>
                                    <h3 className="mb-0 text-info fw-bold">₹{totalOther.toLocaleString('en-IN')}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-dark border-secondary border-start border-3 border-warning h-100 shadow">
                                <div className="card-body py-3">
                                    <p className="text-light fw-semibold mb-1 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>Total Combined Cost</p>
                                    <h3 className="mb-0 text-warning fw-bold">₹{(totalFuel + totalOther).toLocaleString('en-IN')}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 pe-md-4 border-end border-secondary">
                            <h6 className="text-uppercase text-light fw-bold mb-4" style={{ letterSpacing: '1px' }}>Log New Expense</h6>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-light small mb-1 fw-semibold">Vehicle</label>
                                    <select
                                        name="vehicleId"
                                        required
                                        className="form-select bg-dark text-light border-secondary"
                                        value={formData.vehicleId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="" className="bg-dark text-light">Select Vehicle...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id} className="bg-dark text-light">
                                                {v.registrationNumber} ({v.type || 'Vehicle'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label text-light small mb-1 fw-semibold">Expense Type</label>
                                        <select
                                            name="expenseType"
                                            className="form-select bg-dark text-light border-secondary"
                                            value={formData.expenseType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Fuel" className="bg-dark text-light">Fuel</option>
                                            <option value="Toll Tax" className="bg-dark text-light">Toll Tax</option>
                                            <option value="Fines" className="bg-dark text-light">Fines / Challan</option>
                                            <option value="Other" className="bg-dark text-light">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-light small mb-1 fw-semibold">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            className="form-control bg-dark text-light border-secondary"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <label className="form-label text-light small mb-1 fw-semibold">Amount (₹)</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            required
                                            className="form-control bg-dark text-light border-secondary"
                                            placeholder="0"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-light small mb-1 fw-semibold">Odometer (Optional)</label>
                                        <input
                                            type="text"
                                            name="odometer"
                                            className="form-control bg-dark text-light border-secondary"
                                            placeholder="e.g. 45000"
                                            value={formData.odometer}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-success w-100 fw-bold rounded-pill text-dark shadow-sm py-2"
                                >
                                    {isSubmitting ? 'Saving...' : '+ Log Expense'}
                                </button>
                            </form>
                        </div>

                        {/* Right Column: Table */}
                        <div className="col-md-8 ps-md-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="text-uppercase text-light fw-bold mb-0" style={{ letterSpacing: '1px' }}>Expense History</h6>
                                <a href="http://localhost:8080/api/dashboard/export/analytics" className="btn btn-sm btn-outline-info text-light" download>Export CSV</a>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-dark table-hover table-borderless align-middle">
                                    <thead className="border-bottom border-secondary text-light">
                                        <tr style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                            <th className="text-uppercase fw-semibold pb-3">DATE</th>
                                            <th className="text-uppercase fw-semibold pb-3">VEHICLE</th>
                                            <th className="text-uppercase fw-semibold pb-3">TYPE</th>
                                            <th className="text-uppercase fw-semibold pb-3">ODOMETER</th>
                                            <th className="text-uppercase fw-semibold pb-3 text-end">AMOUNT (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-light">
                                                    <div className="spinner-border spinner-border-sm text-info me-2"></div>
                                                    Loading expenses...
                                                </td>
                                            </tr>
                                        ) : expenses.length > 0 ? (
                                            expenses.map((exp, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-light">{exp.date}</td>
                                                    <td className="fw-semibold text-white">{exp.vehicleReg}</td>
                                                    <td>
                                                        <span className={`badge ${exp.badge} px-3 py-1 rounded-pill fw-semibold`}>{exp.type}</span>
                                                    </td>
                                                    <td className="text-light">{exp.odometer}</td>
                                                    <td className="text-end fw-bold text-success">₹{exp.amount.toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">No expenses recorded yet. Log an expense above to save to the database.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FuelExpenses;