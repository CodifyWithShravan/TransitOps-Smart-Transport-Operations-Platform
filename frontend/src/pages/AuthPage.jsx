import React, { useState } from 'react';
import styles from './AuthPage.module.css';
import { authApi } from './services/api';

const AuthPage = () => {
  // 1. Form & Mode States
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('raven.k@transitops.in');
  const [password, setPassword] = useState('********');
  const [role, setRole] = useState('DISPATCHER');
  const [rememberMe, setRememberMe] = useState(true);

  // 2. Error and Loading States
  const [error, setError] = useState({
    visible: false,
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ visible: false, message: '' });
    setIsLoading(true);

    try {
      let data;
      if (isSignUp) {
        console.log('Registering user:', { name, email, role });
        data = await authApi.register({ name, email, password, role });
      } else {
        console.log('Logging in user:', { email });
        data = await authApi.login({ email, password });
      }

      // Store token and redirect
      localStorage.setItem('transitops_token', data.token);
      localStorage.setItem('transitops_user', JSON.stringify(data.user || { name, email, role }));
      window.location.href = '/';
    } catch (err) {
      setError({ visible: true, message: err.message || 'Authentication failed. Please check your details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError({ visible: false, message: '' });
  };

  return (
    <div className={styles.container}>
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
        <div className={styles.footerText}>TRANSITOPS © 2026 · RBAC ENH</div>
      </div>

      {/* Right Login/Register Panel */}
      <div className={styles.rightPanel}>
        {error.visible && (
          <div className={styles.errorBox}>
            <div className={styles.errorHeader}>Error state</div>
            <div className={styles.errorMessage}>❌ {error.message}</div>
          </div>
        )}
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className={styles.formSubtitle}>
            {isSignUp ? 'Sign up to access the TransitOps platform' : 'Enter your credentials to continue'}
          </p>

          {/* Name Input (Only on Sign Up) */}
          {isSignUp && (
            <div className={styles.inputGroup}>
              <label htmlFor="name">FULL NAME</label>
              <input
                type="text"
                id="name"
                placeholder="e.g. Raven K."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
              />
            </div>
          )}

          {/* Email Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="email">EMAIL</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">PASSWORD</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* Role (RBAC) Dropdown - Always visible or on Sign Up */}
          {isSignUp && (
            <div className={styles.inputGroup}>
              <label htmlFor="role">ROLE (RBAC)</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="FLEET_MANAGER">Fleet Manager</option>
                <option value="DISPATCHER">Dispatcher</option>
                <option value="SAFETY_OFFICER">Safety Officer</option>
                <option value="FINANCIAL_ANALYST">Financial Analyst</option>
              </select>
            </div>
          )}

          {/* Remember Me & Forgot Password Row */}
          {!isSignUp && (
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
          )}

          {/* Submit Button */}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading
              ? (isSignUp ? 'Creating Account...' : 'Signing In...')
              : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className={styles.authToggleSection}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            className={styles.authToggleBtn}
            onClick={toggleAuthMode}
          >
            {isSignUp ? 'Sign in here' : 'Sign up here'}
          </button>
        </div>

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