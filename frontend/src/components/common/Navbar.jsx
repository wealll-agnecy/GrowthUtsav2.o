import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { Navbar as BsNavbar, Nav, Container, NavDropdown, Spinner } from 'react-bootstrap';
import { 
    FaUserCircle,
    FaHome, FaCalendarAlt, FaEnvelope, FaShieldAlt, 
    FaSignOutAlt, FaTicketAlt, FaCheckCircle, FaBell, FaClock,
    FaChartLine, FaThLarge
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
            className={`navbar-premium transition-all duration-300 m-0 p-lg-0 ${scrolled ? 'navbar-scrolled' : ''} navbar-light bg-white shadow-sm`}
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
                    <div className="icon-wrapper cursor-pointer" role="button" aria-label="Open Search" onClick={() => setIsSearchOpen(true)}>
                        <BiSearch size={22} />
                    </div>

                    {user && (
                        <div className="position-relative" ref={mobileNotifRef}>
                            <div className="icon-wrapper cursor-pointer" role="button" aria-label="Toggle Notifications" onClick={toggleNotifs}>
                                <BiBell size={22} />
                                {unreadCount > 0 && <span className="badge-ping"></span>}
                            </div>
                        </div>
                    )}
                    
                    {user ? (
                        <div className="position-relative" ref={profileRef}>
                            <div 
                                className="icon-wrapper cursor-pointer" 
                                role="button" aria-label="Toggle Profile Menu"
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
                        <Link to="/login" className="icon-wrapper text-dark" aria-label="Sign In">
                            <FaUserCircle size={24} />
                        </Link>
                    )}
                </div>

                <BsNavbar.Collapse id="main-navbar-nav">
                    {/* Navigation Links */}
                    <Nav className="mx-auto d-flex align-items-center gap-lg-2">
                        {user?.role !== 'staff' && (
                            <>
                                <Nav.Link as={Link} to="/" className={`nav-link-premium ${isActive('/') ? 'active' : ''}`}>
                                    <FaHome className="nav-icon-mini" /> Home
                                </Nav.Link>
                                <Nav.Link as={Link} to="/events" className={`nav-link-premium ${isActive('/events') ? 'active' : ''}`}>
                                    <FaCalendarAlt className="nav-icon-mini" /> Events
                                </Nav.Link>
                                <Nav.Link as={Link} to="/contact-us" className={`nav-link-premium ${isActive('/contact-us') ? 'active' : ''}`}>
                                    <FaEnvelope className="nav-icon-mini" /> Contact Us
                                </Nav.Link>
                            </>
                        )}
                        {user?.role === 'admin' && (
                            <Nav.Link as={Link} to="/admin/dashboard" className={`nav-link-premium ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                                <FaChartLine className="nav-icon-mini" style={{ color: '#0ea5e9' }} /> Admin Console
                            </Nav.Link>
                        )}
                        {user?.role === 'organizer' && (
                            <Nav.Link as={Link} to="/organizer/dashboard" className={`nav-link-premium ${isActive('/organizer/dashboard') ? 'active' : ''}`}>
                                <FaThLarge className="nav-icon-mini" /> Dashboard
                            </Nav.Link>
                        )}
                    </Nav>

                    {/* Right Side Actions */}
                    <div className="d-flex align-items-center gap-3">
                        
                        {/* District Search Toggle */}
                        <div className="icon-wrapper cursor-pointer" role="button" aria-label="Search Events" onClick={() => setIsSearchOpen(true)} title="Search">
                            <BiSearch size={20} />
                        </div>

                        {/* Notification Bell */}
                        <div className="position-relative d-flex align-items-center" style={{ height: '40px' }} ref={notifRef}>
                            <div className="icon-wrapper cursor-pointer" role="button" aria-label="View Notifications" onClick={toggleNotifs} title="Notifications">
                                <BiBell size={22} />
                                {unreadCount > 0 && <span className="badge-ping"></span>}
                            </div>
                        </div>


                        {user ? (
                            <NavDropdown
                                title={
                                    <div className="icon-wrapper cursor-pointer" role="button" aria-label="Profile Menu">
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

            {/* District Search Overlay */}
            <div className={`district-search-overlay ${isSearchOpen ? 'active' : ''}`}>
                <div className="district-search-overlay-bg" onClick={() => setIsSearchOpen(false)}></div>
                <div className="district-search-modal">
                    <input
                        type="text"
                        placeholder="Search for events, artists, categories..."
                        autoFocus={isSearchOpen}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                navigate(`/events?search=${searchQuery}`);
                                setIsSearchOpen(false);
                                setSearchQuery('');
                            }
                            if (e.key === 'Escape') setIsSearchOpen(false);
                        }}
                    />

                    <div className="district-search-categories">
                        <button className="active" onClick={() => { navigate('/events'); setIsSearchOpen(false); }}>All</button>
                        <button onClick={() => { navigate('/events?category=Seminar'); setIsSearchOpen(false); }}>Seminar</button>
                        <button onClick={() => { navigate('/events?category=Makeup Event'); setIsSearchOpen(false); }}>Masterclass</button>
                        <button onClick={() => { navigate('/events?category=Beauty Expo'); setIsSearchOpen(false); }}>Expo</button>
                        <button onClick={() => { navigate('/events?category=Bridal'); setIsSearchOpen(false); }}>Bridal</button>
                        <button onClick={() => { navigate('/events?category=Workshop'); setIsSearchOpen(false); }}>Workshop</button>
                    </div>

                    <div className="district-search-content">
                        <h3>Explore</h3>
                        <div className="district-search-grid">
                            <div className="district-search-item" onClick={() => { navigate('/events'); setIsSearchOpen(false); }}>
                                <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80" alt="Events" />
                                <div className="district-search-item-text">
                                    <h4>All Events</h4>
                                    <p>Browse everything</p>
                                </div>
                            </div>
                            <div className="district-search-item" onClick={() => { navigate('/events?category=Makeup Event'); setIsSearchOpen(false); }}>
                                <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80" alt="Masterclass" />
                                <div className="district-search-item-text">
                                    <h4>Masterclasses</h4>
                                    <p>Learn from the best</p>
                                </div>
                            </div>
                            <div className="district-search-item" onClick={() => { navigate('/events?category=Bridal'); setIsSearchOpen(false); }}>
                                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80" alt="Bridal" />
                                <div className="district-search-item-text">
                                    <h4>Bridal Sessions</h4>
                                    <p>Your big day</p>
                                </div>
                            </div>
                            <div className="district-search-item" onClick={() => { navigate('/events?category=Beauty Expo'); setIsSearchOpen(false); }}>
                                <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80" alt="Expo" />
                                <div className="district-search-item-text">
                                    <h4>Beauty Expos</h4>
                                    <p>Discover trends</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BsNavbar>
    );
};

export default Navbar;
