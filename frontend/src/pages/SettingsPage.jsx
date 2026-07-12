import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/SettingsPage.module.css';
import TopHeader from '../components/TopHeader';

const SettingsPage = () => {
  const sidebarItems = [
    'Dashboard',
    'Fleet',
    'Drivers',
    'Trips',
    'Maintenance',
    'Fuel & Expenses',
    'Analytics',
    'Settings',
  ];

  // Form States
  const [depotName, setDepotName] = useState('Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState('INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');

  // Static Matrix Data for Role-Based Access Control (RBAC)
  const rbacData = [
    { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '—', fuel: '—', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'view', drivers: '—', trips: '✓', fuel: '—', analytics: '—' },
    { role: 'Safety Officer', fleet: '—', drivers: '✓', trips: 'view', fuel: '—', analytics: '—' },
    { role: 'Financial Analyst', fleet: 'view', drivers: '—', trips: '—', fuel: '✓', analytics: '✓' },
  ];

  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert(`Settings saved successfully: ${depotName}, ${currency}, ${distanceUnit}`);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>TransitOps</div>
        <nav className={styles.navMenu}>
          {sidebarItems.map((item) => {
            let path = "/";
            if (item === 'Fleet') path = "/fleet";
            if (item === 'Drivers') path = "/drivers";
            if (item === 'Trips') path = "/trips";
            if (item === 'Maintenance') path = "/maintenance";
            if (item === 'Fuel & Expenses') path = "/fuel";
            if (item === 'Analytics') path = "/analytics";
            if (item === 'Settings') path = "/settings";

            return (
              <Link
                key={item}
                to={path}
                className={`${styles.navItem} ${item === 'Settings' ? styles.activeNavItem : ''}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                {item}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={styles.mainContent}>
        <TopHeader title="Settings & RBAC" />

        <div className={styles.settingsLayout}>
          {/* GENERAL SETTINGS FORM */}
          <section className={styles.formSection}>
            <h2 className={styles.sectionTitle}>GENERAL</h2>
            <form onSubmit={handleSaveChanges}>
              <div className={styles.inputGroup}>
                <label htmlFor="depotName">DEPOT NAME</label>
                <input
                  type="text"
                  id="depotName"
                  value={depotName}
                  onChange={(e) => setDepotName(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="currency">CURRENCY</label>
                <input
                  type="text"
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="distanceUnit">DISTANCE UNIT</label>
                <input
                  type="text"
                  id="distanceUnit"
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.saveBtn}>Save changes</button>
            </form>
          </section>

          {/* RBAC MATRIX TABLE */}
          <section className={styles.matrixSection}>
            <h2 className={styles.sectionTitle}>ROLE-BASED ACCESS (RBAC)</h2>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th>ROLE</th>
                  <th>FLEET</th>
                  <th>DRIVERS</th>
                  <th>TRIPS</th>
                  <th>FUEL/EXP.</th>
                  <th>ANALYTICS</th>
                </tr>
              </thead>
              <tbody>
                {rbacData.map((row, index) => (
                  <tr key={index}>
                    <td className={styles.roleName}>{row.role}</td>
                    <td className={row.fleet === '✓' ? styles.check : ''}>{row.fleet}</td>
                    <td className={row.drivers === '✓' ? styles.check : ''}>{row.drivers}</td>
                    <td className={row.trips === '✓' ? styles.check : ''}>{row.trips}</td>
                    <td className={row.fuel === '✓' ? styles.check : ''}>{row.fuel}</td>
                    <td className={row.analytics === '✓' ? styles.check : ''}>{row.analytics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;