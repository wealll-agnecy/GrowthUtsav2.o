import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Spinner } from 'react-bootstrap';
import { 
    FaSun, FaMoon, FaUserCircle,
    FaHome, FaCalendarAlt, FaEnvelope, FaShieldAlt, 
    FaSignOutAlt, FaTicketAlt, FaCheckCircle, FaBell, FaClock
} from 'react-icons/fa';
import { BiBell, BiUserCircle, BiSearch, BiX } from 'react-icons/bi';
import { ContactModal } from './HelpChatbot';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../../css/navbar.css';
import '../../css/global.css';

import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        clearAll, 
        fetchNotifications 
    } = useNotifications();
    
    const { theme, toggleTheme } = useTheme();
    const isLightMode = theme === 'light';
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef(null);
    const searchRef = useRef(null);

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " min ago";
        return Math.floor(seconds) + " sec ago";
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        // Click outside listener
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleNotifs = () => {
        setIsNotifOpen(!isNotifOpen);
        if (!isNotifOpen) {
            fetchNotifications(); // Refresh when opening
        }
    };

    const handleNotifClick = (notif) => {
        if (!notif.isRead && notif._id) markAsRead(notif._id);
        setIsNotifOpen(false);
        
        const targetEventId = notif.eventId?._id || notif.eventId;
        if (targetEventId) {
            navigate(`/events/${targetEventId}`);
        } else {
            navigate('/notifications');
        }
    };

    return (
        <BsNavbar 
            expand="lg" 
            fixed="top" 
            className={`navbar-premium transition-all duration-300 m-0 p-lg-0 ${scrolled ? 'navbar-scrolled' : ''} ${isLightMode ? 'navbar-light bg-white shadow-sm' : 'navbar-dark bg-dark'}`}
        >
            <Container fluid className="px-lg-5">
                {/* Brand Logo */}
                <BsNavbar.Brand as={Link} to="/" className="navbar-brand">
                    Growth<span className="brand-accent">Utsav</span>
                </BsNavbar.Brand>

                {/* Mobile Toggle */}
                <BsNavbar.Toggle aria-controls="main-navbar-nav" className="border-0 shadow-none">
                    <span className="navbar-toggler-icon"></span>
                </BsNavbar.Toggle>

                <BsNavbar.Collapse id="main-navbar-nav">
                    {/* Navigation Links */}
                    <Nav className="mx-auto d-flex align-items-center gap-lg-2">
                        <Nav.Link as={Link} to="/" className={`nav-link-premium ${isActive('/') ? 'active' : ''}`}>Home</Nav.Link>
                        <Nav.Link as={Link} to="/events" className={`nav-link-premium ${isActive('/events') ? 'active' : ''}`}>Events</Nav.Link>
                        <Nav.Link as={Link} to="/contact-us" className={`nav-link-premium ${isActive('/contact-us') ? 'active' : ''}`}>Contact Us</Nav.Link>
                        {user?.role === 'admin' && (
                            <Nav.Link as={Link} to="/admin/dashboard" className={`nav-link-premium ${isActive('/admin/dashboard') ? 'active' : ''}`}>Admin Console</Nav.Link>
                        )}
                        {user?.role === 'organizer' && (
                            <Nav.Link as={Link} to="/organizer/dashboard" className={`nav-link-premium ${isActive('/organizer/dashboard') ? 'active' : ''}`}>Dashboard</Nav.Link>
                        )}
                    </Nav>

                    {/* Right Side Actions */}
                    <div className="d-flex align-items-center gap-3">
                        
                        {/* Sliding Search Bar */}
                        <div className="position-relative d-flex align-items-center" ref={searchRef}>
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 250, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        className="search-bar-container"
                                    >
                                        <input 
                                            type="text" 
                                            placeholder="Search events, artists..." 
                                            className="search-input-navbar"
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && navigate(`/events?query=${searchQuery}`)}
                                        />
                                        <BiX className="search-close-icon" onClick={() => setIsSearchOpen(false)} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {!isSearchOpen && (
                                <div className="icon-wrapper cursor-pointer" onClick={() => setIsSearchOpen(true)} title="Search">
                                    <BiSearch size={20} />
                                </div>
                            )}
                        </div>

                        {/* Notification Bell */}
                        <div className="position-relative" ref={notifRef}>
                            <div className="icon-wrapper cursor-pointer" onClick={toggleNotifs} title="Notifications">
                                <BiBell size={22} />
                                {unreadCount > 0 && <span className="badge-ping"></span>}
                            </div>

                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                        className="notification-dropdown position-absolute end-0 premium-notif-panel"
                                    >
                                        <div className="p-2 border-bottom d-flex justify-content-between align-items-center">
                                            <span className="fw-bold small px-2">RECENT SIGNALS</span>
                                            {notifications.length > 0 && (
                                                <button onClick={clearAll} className="btn btn-link btn-sm text-danger text-decoration-none tiny-text fw-bold">CLEAR ALL</button>
                                            )}
                                        </div>

                                        <div className="notification-list premium-notif-list">
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div key={n._id || Math.random()} onClick={() => handleNotifClick(n)} className={`dropdown-item border-bottom ${!n.isRead ? 'bg-light' : ''}`}>
                                                        <div className="d-flex gap-3 align-items-start">
                                                            <div className="icon-circle bg-primary bg-opacity-10 text-primary mt-1">
                                                                <FaBell size={12} />
                                                            </div>
                                                            <div className="flex-grow-1 overflow-hidden">
                                                                <div className={`tiny-text text-truncate mb-1 ${!n.isRead ? 'fw-bold' : 'text-muted'}`}>{n.message}</div>
                                                                <div className="text-muted tiny-timestamp">{timeAgo(n.createdAt)}</div>
                                                            </div>
                                                            {!n.isRead && <div className="unread-dot-small bg-primary mt-2"></div>}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-muted small">No notifications found</div>
                                            )}
                                        </div>
                                        <div className="mt-2 pt-2 border-top text-center">
                                            <Link to="/notifications" className="tiny-text fw-bold text-primary text-decoration-none" onClick={() => setIsNotifOpen(false)}>VIEW ALL LOGS</Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Theme Toggle */}
                        <div className="icon-wrapper cursor-pointer" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <FaMoon size={18} className="text-muted" /> : <FaSun size={18} className="text-warning" />}
                        </div>

                        {user ? (
                            <NavDropdown
                                title={
                                    <div className="icon-wrapper cursor-pointer">
                                        <BiUserCircle size={22} />
                                    </div>
                                }
                                align="end"
                                className="profile-dropdown-premium dropdown-no-caret"
                            >
                                <div className="px-3 py-2 border-bottom mb-2">
                                    <div className="fw-bold small">{user.name}</div>
                                    <div className="text-muted tiny-text uppercase">{user.role}</div>
                                </div>
                                <NavDropdown.Item as={Link} to="/profile">My Account</NavDropdown.Item>
                                {user.role === 'admin' ? (
                                    <NavDropdown.Item as={Link} to="/admin/dashboard">Admin Panel</NavDropdown.Item>
                                ) : user.role === 'organizer' ? (
                                    <NavDropdown.Item as={Link} to="/organizer/dashboard">Management</NavDropdown.Item>
                                ) : (
                                    <NavDropdown.Item as={Link} to="/my-bookings">My Tickets</NavDropdown.Item>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold">Sign Out</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <Link to="/login" className="btn btn-premium-outline">Sign In</Link>
                                <Link to="/register" className="btn btn-premium-gradient">Get Started</Link>
                            </div>
                        )}
                    </div>
                </BsNavbar.Collapse>
            </Container>

            <ContactModal show={showContact} onClose={() => setShowContact(false)} />
        </BsNavbar>
    );
};

export default Navbar;
