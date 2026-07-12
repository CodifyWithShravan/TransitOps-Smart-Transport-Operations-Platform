import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopHeader from '../components/TopHeader';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/FuelExpenses.css';

const FuelExpenses = () => {
    const [vehicles, setVehicles] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        vehicleId: '',
        expenseType: 'Fuel',
        amount: '',
        odometer: '',
        date: new Date().toISOString().split('T')[0]
    });

    const navItems = ['Dashboard', 'Fleet', 'Drivers', 'Trips', 'Maintenance', 'Fuel & Expenses', 'Analytics', 'Settings'];

    useEffect(() => {
        setVehicles([
            { id: 'V01', make: 'VAN-05', reg: 'GJ01AB452' },
            { id: 'V02', make: 'TRUCK-11', reg: 'GJ01AB998' },
            { id: 'V03', make: 'MINI-03', reg: 'GJ01AB1120' }
        ]);

        setExpenses([
            { id: 'EXP-992', vehicleReg: 'GJ01AB998', type: 'Fuel', amount: 8500, odometer: '182,150', date: '2026-07-11', badge: 'bg-success' },
            { id: 'EXP-991', vehicleReg: 'GJ01AB452', type: 'Toll Tax', amount: 450, odometer: '—', date: '2026-07-10', badge: 'bg-secondary' },
            { id: 'EXP-990', vehicleReg: 'GJ01AB1120', type: 'Fuel', amount: 3200, odometer: '66,120', date: '2026-07-09', badge: 'bg-success' }
        ]);

        setIsLoading(false);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
        if (!selectedVehicle) return;

        const newExpense = {
            id: `EXP-${Math.floor(Math.random() * 1000) + 1000}`,
            vehicleReg: selectedVehicle.reg,
            type: formData.expenseType,
            amount: parseInt(formData.amount) || 0,
            odometer: formData.odometer || '—',
            date: formData.date,
            badge: formData.expenseType === 'Fuel' ? 'bg-success' : 'bg-secondary'
        };

        setExpenses([newExpense, ...expenses]);
        setFormData({ vehicleId: '', expenseType: 'Fuel', amount: '', odometer: '', date: new Date().toISOString().split('T')[0] });
    };

    const totalFuel = expenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
    const totalOther = expenses.filter(e => e.type !== 'Fuel').reduce((sum, e) => sum + e.amount, 0);

    if (isLoading) return null;

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
                            <div className="card bg-dark border-secondary border-start border-3 border-success h-100">
                                <div className="card-body py-3">
                                    <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Total Fuel (Last 30 Days)</p>
                                    <h3 className="mb-0 text-success">₹{totalFuel.toLocaleString('en-IN')}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-dark border-secondary border-start border-3 border-secondary h-100">
                                <div className="card-body py-3">
                                    <p className="text-muted mb-1 text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Tolls & Other Expenses</p>
                                    <h3 className="mb-0">₹{totalOther.toLocaleString('en-IN')}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 pe-md-4 border-end border-secondary">
                            <h6 className="text-uppercase text-muted mb-4" style={{ letterSpacing: '1px' }}>Log New Expense</h6>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small mb-1">Vehicle</label>
                                    <select name="vehicleId" required className="form-select bg-transparent text-light border-secondary" value={formData.vehicleId} onChange={handleInputChange}>
                                        <option value="">Select Vehicle...</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.reg}</option>)}
                                    </select>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label text-secondary small mb-1">Expense Type</label>
                                        <select name="expenseType" className="form-select bg-transparent text-light border-secondary" value={formData.expenseType} onChange={handleInputChange}>
                                            <option value="Fuel">Fuel</option>
                                            <option value="Toll Tax">Toll Tax</option>
                                            <option value="Fines">Fines / Challan</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-secondary small mb-1">Date</label>
                                        <input type="date" name="date" required className="form-control bg-transparent text-light border-secondary" value={formData.date} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <label className="form-label text-secondary small mb-1">Amount (₹)</label>
                                        <input type="number" name="amount" required className="form-control bg-transparent text-light border-secondary" placeholder="0" value={formData.amount} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-secondary small mb-1">Odometer (Optional)</label>
                                        <input type="text" name="odometer" className="form-control bg-transparent text-light border-secondary" placeholder="e.g. 45000" value={formData.odometer} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-success w-100 fw-bold rounded-pill text-dark shadow-sm">
                                    + Log Expense
                                </button>
                            </form>
                        </div>

                        {/* Right Column: Table */}
                        <div className="col-md-8 ps-md-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="text-uppercase text-muted mb-0" style={{ letterSpacing: '1px' }}>Expense History</h6>
                                <button className="btn btn-sm btn-outline-secondary">Export CSV</button>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-dark table-hover table-borderless align-middle">
                                    <thead className="border-bottom border-secondary text-muted">
                                        <tr style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                            <th className="text-uppercase fw-normal pb-3">DATE</th>
                                            <th className="text-uppercase fw-normal pb-3">VEHICLE</th>
                                            <th className="text-uppercase fw-normal pb-3">TYPE</th>
                                            <th className="text-uppercase fw-normal pb-3">ODOMETER</th>
                                            <th className="text-uppercase fw-normal pb-3 text-end">AMOUNT (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.length > 0 ? (
                                            expenses.map((exp, idx) => (
                                                <tr key={idx}>
                                                    <td className="text-secondary">{exp.date}</td>
                                                    <td className="fw-semibold">{exp.vehicleReg}</td>
                                                    <td>
                                                        <span className={`badge ${exp.badge} px-2 py-1 rounded`}>{exp.type}</span>
                                                    </td>
                                                    <td className="text-secondary">{exp.odometer}</td>
                                                    <td className="text-end fw-bold">₹{exp.amount.toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">No expenses recorded.</td>
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