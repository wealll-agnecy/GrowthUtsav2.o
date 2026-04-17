import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import '../../css/footer.css';

const Footer = () => {
    return (
        <footer className="beauty-footer">
            <Container>
                <Row className="g-5">
                    {/* Brand Section */}
                    <Col lg={4} md={12}>
                        <Link to="/" className="footer-brand">
                            Growth<span className="brand-accent">Utsav</span>
                        </Link>
                        <p className="footer-desc">
                            The premier destination for luxury beauty events and elite styling masterclasses. Discover our world of elegance.
                        </p>
                        <div className="footer-socials">
                            <a href="#" className="social-link"><FaFacebookF /></a>
                            <a href="#" className="social-link"><FaInstagram /></a>
                            <a href="#" className="social-link"><FaTwitter /></a>
                            <a href="#" className="social-link"><FaLinkedinIn /></a>
                        </div>
                    </Col>

                    {/* Quick Links */}
                    <Col lg={2} md={4} xs={6}>
                        <h6 className="footer-heading">Platform</h6>
                        <ul className="footer-links">
                            <li><Link to="/events">All Events</Link></li>
                            <li><Link to="/events?category=Makeup Event">Masterclasses</Link></li>
                            <li><Link to="/events?category=Beauty Expo">Expos & Fairs</Link></li>
                            <li><Link to="/events?category=Bridal">Bridal Sessions</Link></li>
                        </ul>
                    </Col>

                    {/* Support */}
                    <Col lg={2} md={4} xs={6}>
                        <h6 className="footer-heading">Company</h6>
                        <ul className="footer-links">
                            <li><Link to="/about">Our Story</Link></li>
                            <li><Link to="/contact-us">Contact Us</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </Col>

                    {/* Newsletter */}
                    <Col lg={4} md={4} xs={12}>
                        <h6 className="footer-heading">Elegance in Your Inbox</h6>
                        <p className="small mb-4">Subscribe to receive updates on exclusive masterclasses and early-bird access.</p>
                        <div className="d-flex gap-2">
                            <input 
                                type="email" 
                                className="form-control rounded-pill px-4 border-light bg-light" 
                                placeholder="name@luxury.com"
                            />
                            <button className="btn btn-primary rounded-pill px-4" style={{ backgroundColor: '#ec4899', borderColor: '#ec4899' }}>
                                Subscribe
                            </button>
                        </div>
                    </Col>
                </Row>

                <div className="footer-bottom mt-5 pt-4 border-top">
                    <p className="mb-0 text-muted small">© 2026 GrowthUtsav. Designed for the elite beauty community.</p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
