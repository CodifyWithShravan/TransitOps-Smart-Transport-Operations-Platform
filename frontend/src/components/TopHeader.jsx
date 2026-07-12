import React from 'react';

const TopHeader = ({ title, searchTerm, onSearchChange, searchPlaceholder = "Search..." }) => {
  const userStr = localStorage.getItem('transitops_user');
  let user = {};
  try {
    user = userStr ? JSON.parse(userStr) : {};
  } catch (e) {
    user = {};
  }

  const rawName = user.name || (user.email ? user.email.split('@')[0] : 'Operator');
  // Format name nicely (capitalize)
  const name = rawName
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Calculate initials (up to 2 letters)
  const words = name.trim().split(/\s+/);
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();

  // Format role
  const rawRole = user.role || 'DISPATCHER';
  const roleDisplay = rawRole
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleLogout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    window.location.href = '/login';
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
      <div className="w-50 d-flex align-items-center">
        {title ? (
          <h5 className="mb-0 text-white me-4">{title}</h5>
        ) : null}
        {onSearchChange !== undefined ? (
          <input
            type="text"
            className="form-control bg-transparent text-light border-secondary w-50"
            placeholder={searchPlaceholder}
            value={searchTerm || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        ) : !title ? (
          <input
            type="text"
            className="form-control bg-transparent text-light border-secondary w-50"
            placeholder={searchPlaceholder}
          />
        ) : null}
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="text-end">
          <span className="text-light fw-semibold small d-block">{name}</span>
          <small className="text-info" style={{ fontSize: '11px' }}>{roleDisplay}</small>
        </div>
        <div
          className="rounded-circle bg-warning text-dark fw-bold text-center d-flex justify-content-center align-items-center shadow-sm"
          style={{ width: '38px', height: '38px', fontSize: '14px', letterSpacing: '0.5px' }}
          title={`${name} (${roleDisplay})`}
        >
          {initials}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-pill px-3"
          title="Sign out"
        >
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default TopHeader;
