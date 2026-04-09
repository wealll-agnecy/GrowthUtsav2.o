import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './MobileHeader.css';

const MobileHeader = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isLightMode = theme === 'light';
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
                    onClick={toggleTheme}
                    className="theme-toggle-btn border-0 bg-transparent mobile-action-btn"
                >
                    {isLightMode ? <FaMoon size={18} /> : <FaSun size={18} />}
                </button>
                <button
                    onClick={() => navigate('/events')}
                    className="theme-toggle-btn border-0 bg-transparent mobile-action-btn"
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
                Verification Pending ⏳
            </div>
        )}
        </>
    );
};

export default MobileHeader;
