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
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef(null);
    const mobileNotifRef = useRef(null);
    const profileRef = useRef(null);
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
            if (notifRef.current && !notifRef.current.contains(event.target) && 
                mobileNotifRef.current && !mobileNotifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
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
        
        // Robust ID Extraction
        const targetEventId = notif.eventId?._id || notif.eventId || notif.event?._id || notif.event;
        
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
                <BsNavbar.Brand as={Link} to="/" className="logo-container">
                    <h1 className="logo-text mb-0">
                        <span className="growth">Growth</span>
                        <span className="utsav">Utsav</span>
                    </h1>
                    <p className="tagline mb-0">AN EVENT SERIES OF WE ALL</p>
                </BsNavbar.Brand>

                {/* Mobile Icons (Visible only on mobile) */}
                <div className="d-md-none d-flex align-items-center gap-2">
                    <div className="position-relative" ref={searchRef}>
                        <div className="icon-wrapper text-white cursor-pointer" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                            <BiSearch size={22} />
                        </div>

                        {/* Mobile Search Overlay Popup */}
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mobile-search-popup shadow-premium"
                                >
                                    <div className="search-inner-mobile">
                                        <BiSearch className="ms-2 text-muted" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search events..." 
                                            className="search-input-mobile"
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (navigate(`/events?search=${searchQuery}`), setIsSearchOpen(false))}
                                        />
                                        <BiX className="me-2 text-muted cursor-pointer" size={22} onClick={() => setIsSearchOpen(false)} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {user && (
                        <div className="position-relative" ref={mobileNotifRef}>
                            <div className="icon-wrapper text-white cursor-pointer" onClick={toggleNotifs}>
                                <BiBell size={22} />
                                {unreadCount > 0 && <span className="badge-ping"></span>}
                            </div>
                        </div>
                    )}
                    
                    {user ? (
                        <div className="position-relative" ref={profileRef}>
                            <div 
                                className="icon-wrapper text-white cursor-pointer" 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <BiUserCircle size={26} />
                            </div>
                            
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="profile-dropdown-mobile shadow-premium"
                                    >
                                        <div className="px-3 py-2 border-bottom mb-1">
                                            <div className="fw-bold small text-dark">{user.name}</div>
                                            <div className="text-muted tiny-text uppercase">{user.role}</div>
                                        </div>
                                        <Link 
                                            to="/profile" 
                                            className="dropdown-item-mobile"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            My Account
                                        </Link>
                                        <div 
                                            className="dropdown-item-mobile text-danger fw-bold"
                                            onClick={() => {
                                                handleLogout();
                                                setIsProfileOpen(false);
                                            }}
                                        >
                                            Sign Out
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/login" className="icon-wrapper text-white">
                            <FaUserCircle size={24} />
                        </Link>
                    )}
                </div>

                <BsNavbar.Collapse id="main-navbar-nav">
                    {/* Navigation Links */}
                    <Nav className="mx-auto d-flex align-items-center gap-lg-2">
                        {user?.role !== 'staff' && (
                            <>
                                <Nav.Link as={Link} to="/" className={`nav-link-premium ${isActive('/') ? 'active' : ''}`}>Home</Nav.Link>
                                <Nav.Link as={Link} to="/events" className={`nav-link-premium ${isActive('/events') ? 'active' : ''}`}>Events</Nav.Link>
                                <Nav.Link as={Link} to="/contact-us" className={`nav-link-premium ${isActive('/contact-us') ? 'active' : ''}`}>Contact Us</Nav.Link>
                            </>
                        )}
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
                        <div className="position-relative d-flex align-items-center" style={{ height: '40px' }} ref={searchRef}>
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 250, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        className="search-bar-container"
                                    >
                                        <div className="position-relative d-flex align-items-center w-100">
                                            <BiSearch className="search-icon-inside" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Search events, artists..." 
                                                className="search-input-navbar"
                                                autoFocus
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                            <BiX className="search-close-icon" onClick={() => setIsSearchOpen(false)} />
                                        </div>
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
                        <div className="position-relative d-flex align-items-center" style={{ height: '40px' }} ref={notifRef}>
                            <div className="icon-wrapper cursor-pointer" onClick={toggleNotifs} title="Notifications">
                                <BiBell size={22} />
                                {unreadCount > 0 && <span className="badge-ping"></span>}
                            </div>
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
                                {user.role !== 'staff' && (
                                    <NavDropdown.Item as={Link} to="/profile">My Account</NavDropdown.Item>
                                )}
                                {user.role === 'admin' ? (
                                    <NavDropdown.Item as={Link} to="/admin/dashboard">Admin Panel</NavDropdown.Item>
                                ) : user.role === 'organizer' ? (
                                    <NavDropdown.Item as={Link} to="/organizer/dashboard">Management</NavDropdown.Item>
                                ) : user.role === 'staff' ? (
                                    <>
                                        <NavDropdown.Item as={Link} to="/staff/scanner">Scanner</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/staff/dashboard">Dashboard</NavDropdown.Item>
                                    </>
                                ) : (
                                    <NavDropdown.Item as={Link} to="/my-bookings">My Tickets</NavDropdown.Item>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold">Sign Out</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <Link to="/login" className="btn btn-outline-pink">Sign In</Link>
                                <Link to="/register" className="btn btn-pink">Get Started</Link>
                            </div>
                        )}
                    </div>
                </BsNavbar.Collapse>
            </Container>

            {/* Shared Notification Popup - Moved outside container for better positioning */}
            <AnimatePresence>
                {isNotifOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="notification-dropdown premium-notif-panel shadow-premium"
                        style={{ right: '2rem' }} // Precise desktop positioning
                    >
                        <div className="p-2 border-bottom d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-black tiny-text tracking-widest text-uppercase">Recent Signals</span>
                            {notifications.length > 0 && (
                                <button onClick={clearAll} className="btn btn-link btn-sm text-danger text-decoration-none tiny-text fw-bold p-0">Clear All</button>
                            )}
                        </div>

                        <div className="premium-notif-list">
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div 
                                        key={n._id || Math.random()} 
                                        onClick={() => handleNotifClick(n)} 
                                        className={`notif-item-premium ${!n.isRead ? 'notif-item-unread' : ''}`}
                                    >
                                        <div className="notif-icon-box">
                                            <BiBell size={18} />
                                        </div>
                                        <div className="notif-text-content">
                                            <div className="notif-msg">{n.message}</div>
                                            <div className="notif-time-ago">
                                                <FaClock size={10} /> {timeAgo(n.createdAt)}
                                            </div>
                                        </div>
                                        {!n.isRead && <div className="unread-indicator"></div>}
                                    </div>
                                ))
                            ) : (
                                <div className="p-5 text-center text-muted small opacity-50">
                                    <BiBell size={40} className="mb-2 d-block mx-auto" />
                                    No new signals detected.
                                </div>
                            )}
                        </div>
                        
                        <div className="notif-footer-premium">
                            <Link to="/notifications" className="btn-view-all btn d-flex align-items-center justify-content-center" onClick={() => setIsNotifOpen(false)}>
                                View All Logs
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ContactModal show={showContact} onClose={() => setShowContact(false)} />
        </BsNavbar>
    );
};

export default Navbar;
