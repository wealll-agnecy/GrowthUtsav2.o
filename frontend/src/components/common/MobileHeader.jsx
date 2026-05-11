import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

import './MobileHeader.css';

const MobileHeader = () => {
    const { user } = useAuth();

    const navigate = useNavigate();


    return (
        <>
        <div 
            className="d-lg-none fixed-top d-flex align-items-center justify-content-between px-3 py-0 w-100 mobile-header-container"
        >
            <Link
                to="/"
                className="fw-black fs-4 text-decoration-none d-flex align-items-center mobile-header-brand"
            >
                GU<span className="brand-dot">.</span>
            </Link>


            <div className="d-flex align-items-center gap-2">
                <button
                    onClick={() => navigate('/events')}
                    className="theme-toggle-btn bg-transparent mobile-action-btn btn rounded-pill fw-medium px-4 py-2 btn-primary"
                >
                    <FaSearch size={18} />
                </button>
                <Link
                    to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/attendee/dashboard') : '/login'}
                    className="profile-avatar-node shadow-glow-hover d-flex align-items-center justify-content-center mobile-profile-node"
                >
                    <FaUserCircle size={24} color="#fff" />
                </Link>
            </div>


        </div>
        {user?.role === 'organizer' && user?.status === 'pending' && (
            <div 
                className="verification-pending-banner text-center py-2 fw-bold small text-uppercase tracking-widest d-lg-none verification-banner-mobile"
            >
                Verification Pending â³
            </div>
        )}
        </>
    );
};

export default MobileHeader;
