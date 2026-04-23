import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import '../../css/footer.css';

const Footer = () => {
    return (
        <footer className="premium-footer">
            <Container>
                <Row className="gy-5">
                    {/* 1. BRAND */}
                    <Col lg={3} md={6}>
                        <Link to="/" className="footer-logo text-decoration-none">
                            Growth<span className="logo-accent">Utsav</span>
                        </Link>
                        <p className="footer-text">
                            The premier destination for luxury beauty events and elite styling masterclasses.
                        </p>
                    </Col>

                    {/* 2. PLATFORM LINKS */}
                    <Col lg={2} md={6}>
                        <h6>Platform</h6>
                        <ul className="footer-link-list">
                            <li><Link to="/events" className="footer-link">All Events</Link></li>
                            <li><Link to="/events?category=Makeup Event" className="footer-link">Masterclasses</Link></li>
                            <li><Link to="/events?category=Beauty Expo" className="footer-link">Expos & Fairs</Link></li>
                            <li><Link to="/events?category=Bridal" className="footer-link">Bridal Sessions</Link></li>
                        </ul>
                    </Col>

                    {/* 3. COMPANY */}
                    <Col lg={2} md={6}>
                        <h6>Company</h6>
                        <ul className="footer-link-list">
                            <li><Link to="/about" className="footer-link">Our Story</Link></li>
                            <li><Link to="/contact-us" className="footer-link">Contact Us</Link></li>
                            <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
                        </ul>
                    </Col>

                    {/* 4. NEWSLETTER & SOCIALS */}
                    <Col lg={5} md={6}>
                        <h6>Elegance in Your Inbox</h6>
                        <p className="footer-text">
                            Subscribe to receive updates on exclusive masterclasses and events.
                        </p>

                        <div className="newsletter-box">
                            <input type="email" placeholder="name@luxury.com" />
                            <button type="button" className="btn btn-pink">Subscribe</button>
                        </div>

                        <div className="footer-social-icons">
                            <a href="https://www.facebook.com/share/1AWNViGDuE/" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                <FaFacebookF />
                            </a>
                            <a href="https://www.instagram.com/growthutsav?igsh=NHZxaHdlbDk5dWNt" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                <FaInstagram />
                            </a>
                            <a href="#" className="social-icon-link">
                                <FaTwitter />
                            </a>
                            <a href="#" className="social-icon-link">
                                <FaLinkedinIn />
                            </a>
                        </div>
                    </Col>
                </Row>

                <hr className="footer-divider" />

                <div className="footer-bottom-text text-center">
                    <p className="mb-0">© 2026 GrowthUtsav. Designed for the elite beauty community.</p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
