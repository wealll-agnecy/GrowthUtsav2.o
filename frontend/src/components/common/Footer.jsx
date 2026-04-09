import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaRocket } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer border-top border-white/5 py-5 mt-5">
            <Container fluid className="px-md-5">
                <Row className="g-5">
                    {/* Brand Section */}
                    <Col lg={4} md={12}>
                        <Link to="/" className="fw-black fs-3 text-decoration-none mb-4 d-block footer-brand-title">
                            GrowthUtsav
                        </Link>
                        <p className="text-white-50 small mb-4 opacity-70 fw-medium footer-description-box">
                            The premier protocol for elite event infrastructure and digital guest experiences. Bridging the gap between visionary organizers and eager attendees.
                        </p>
                        <div className="d-flex gap-3">
                            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                                <a key={i} href="#" className="text-white-50 hover-text-white transition-all">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </Col>

                    {/* Sector Links */}
                    <Col lg={2} md={4} xs={6}>
                        <h6 className="fw-black text-white text-uppercase tracking-widest small mb-4">Sectors</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small fw-bold">
                            <li><Link to="/events?category=Technology" className="text-white-50 text-decoration-none hover-text-white transition-all">Technology</Link></li>
                            <li><Link to="/events?category=Music" className="text-white-50 text-decoration-none hover-text-white transition-all">Music & Arts</Link></li>
                            <li><Link to="/events?category=Business" className="text-white-50 text-decoration-none hover-text-white transition-all">Business</Link></li>
                            <li><Link to="/events?category=Workshop" className="text-white-50 text-decoration-none hover-text-white transition-all">Workshops</Link></li>
                        </ul>
                    </Col>

                    {/* Quick Access */}
                    <Col lg={2} md={4} xs={6}>
                        <h6 className="fw-black text-white text-uppercase tracking-widest small mb-4">Quick Access</h6>
                        <ul className="list-unstyled d-flex flex-column gap-2 small fw-bold">
                            <li><Link to="/events" className="text-white-50 text-decoration-none hover-text-white transition-all">Explore Events</Link></li>
                            <li><Link to="/login?role=organizer" className="text-white-50 text-decoration-none hover-text-white transition-all">Host Event</Link></li>
                            <li><Link to="/register" className="text-white-50 text-decoration-none hover-text-white transition-all">Get Started</Link></li>
                            <li><Link to="/login" className="text-white-50 text-decoration-none hover-text-white transition-all">Re-Authorize</Link></li>
                        </ul>
                    </Col>

                    {/* Mission Control */}
                    <Col lg={4} md={4} xs={12}>
                        <div className="glass-card p-4 rounded-4 border-white/5 bg-white/2">
                            <h6 className="fw-black text-white text-uppercase tracking-widest small mb-3">Mission control</h6>
                            <p className="text-white-50 small mb-3 opacity-70">
                                Subscribe to receive high-fidelity updates and event protocols directly.
                            </p>
                            <div className="d-flex gap-2">
                                <input 
                                    type="email" 
                                    className="form-control-modern py-2 text-white footer-subscribe-input" 
                                    placeholder="your-link@email.com"
                                />
                                <button className="btn-primary footer-subscribe-btn">
                                    <FaRocket size={14} />
                                </button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Base Metadata */}
                <div className="mt-5 pt-4 border-top border-white/5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <p className="mb-0 small fw-black uppercase tracking-widest text-white-50 text-center text-md-start">
                        © 2026 <span className="text-white">GrowthUtsav</span> — Global Event Infrastructure
                    </p>
                    <div className="d-flex gap-4 small fw-black tracking-widest uppercase">
                        <span className="text-white-50 hover-text-white cursor-pointer transition-all">System Status: Optimal</span>
                        <span className="text-white-50 hover-text-white cursor-pointer transition-all">Protocol v4.0.2</span>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
