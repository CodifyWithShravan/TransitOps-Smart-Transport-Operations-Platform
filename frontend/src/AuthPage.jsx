import React, { useState } from 'react';
import styles from './AuthPage.module.css';
import { authApi } from './services/api';

const AuthPage = () => {
  // 1. Form States
  const [email, setEmail] = useState('raven.k@transitops.in');
  const [password, setPassword] = useState('********');
  const [role, setRole] = useState('Dispatcher');
  const [rememberMe, setRememberMe] = useState(true);

  // 2. Error and Loading States (Backend Prep)
  const [error, setError] = useState({
    visible: true,
    message: 'Invalid credentials. Account locked after 5 failed attempts.',
  });
  const [isLoading, setIsLoading] = useState(false);

  // 3. Handle Form Submission to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ visible: false, message: '' });
    setIsLoading(true);

    const loginPayload = { email, password }; // backend login DTO typically only takes email and password

    try {
      console.log('Sending data to backend:', loginPayload);
      
      const data = await authApi.login(loginPayload);
      
      // Store token and redirect based on role
      localStorage.setItem('transitops_token', data.token);
      localStorage.setItem('transitops_user', JSON.stringify(data.user));
      window.location.href = '/';
      
    } catch (err) {
      setError({ visible: true, message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Branding Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.brandingWrapper}>
          <div className={styles.logoPlaceholder}></div>
          <h1 className={styles.brandTitle}>TransitOps</h1>
          <p className={styles.brandSubtitle}>Smart Transport Operations Platform</p>
          
          <div className={styles.rolesListSection}>
            <p className={styles.rolesHeading}>One login, four roles:</p>
            <ul className={styles.rolesList}>
              <li>Fleet Manager</li>
              <li>Dispatcher</li>
              <li>Safety Officer</li>
              <li>Financial Analyst</li>
            </ul>
          </div>
        </div>
        <div className={styles.footerText}>
          TRANSITOPS © 2026 · RBAC ENH
        </div>
      </div>

      {/* Right Login Panel */}
      <div className={styles.rightPanel}>
        {/* Error State Callout Box */}
        {error.visible && (
          <div className={styles.errorBox}>
            <div className={styles.errorHeader}>Error state</div>
            <div className={styles.errorMessage}>❌ {error.message}</div>
          </div>
        )}

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Sign in to your account</h2>
          <p className={styles.formSubtitle}>Enter your credentials to continue</p>

          {/* Email Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Role (RBAC) Dropdown */}
          <div className={styles.inputGroup}>
            <label htmlFor="role">ROLE (RBAC)</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Fleet Manager">Fleet Manager</option>
              <option value="Dispatcher">Dispatcher</option>
              <option value="Safety Officer">Safety Officer</option>
              <option value="Financial Analyst">Financial Analyst</option>
            </select>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className={styles.forgotLink}>Forgot password?</a>
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Access Scope Info Text */}
        <div className={styles.accessScopeInfo}>
          <p>Access is scoped by role after login:</p>
          <ul>
            <li>• Fleet Manager → Fleet, Maintenance</li>
            <li>• Dispatcher → Dashboard, Trips</li>
            <li>• Safety Officer → Drivers, Compliance</li>
            <li>• Financial Analyst → Fuel & Expenses, Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;