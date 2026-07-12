import React from 'react';

const ComingSoonModal = ({ moduleName, onClose }) => {
    if (!moduleName) return null;
    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 }}>
            <div className="card bg-dark border border-info text-light p-4 rounded-4 shadow-lg text-center" style={{ maxWidth: '420px', width: '90%' }}>
                <div className="mb-3">
                    <span style={{ fontSize: '3rem' }}>🚧</span>
                </div>
                <h4 className="fw-bold mb-2 text-info">Coming Soon!</h4>
                <p className="text-secondary small mb-4">
                    The <strong className="text-light">{moduleName}</strong> module is currently being developed by the frontend team and will be integrated soon.
                </p>
                <button className="btn btn-info rounded-pill px-4 fw-bold text-dark w-100" onClick={onClose}>
                    Got It
                </button>
            </div>
        </div>
    );
};

export default ComingSoonModal;
