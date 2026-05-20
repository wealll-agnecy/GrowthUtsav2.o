import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import '../../css/footer.css';

const Footer = () => {
    return (
        <footer className="footer-section-district">
            <div className="footer-container-district">
                <Row className="align-items-center gy-4 mb-4">
                    {/* Brand Column */}
                    <Col lg={4} md={12} className="text-lg-start text-center">
                        <Link to="/" className="footer-logo-district text-decoration-none">
                            <span className="logo-main">GrowthUtsav</span>
                            <span className="logo-sub">BY WE ALLL</span>
                        </Link>
                    </Col>

                    {/* Nav Links Column */}
                    <Col lg={5} md={12} className="d-flex flex-wrap justify-content-center gap-md-4 gap-3">
                        <Link to="/terms" className="footer-link-district">Terms & Conditions</Link>
                        <Link to="/privacy" className="footer-link-district">Privacy Policy</Link>
                        <Link to="/contact-us" className="footer-link-district">Contact Us</Link>
                        <Link to="/organizer/events" className="footer-link-district">List your events</Link>
                    </Col>

                    {/* QR Code Column */}
                    <Col lg={3} md={12} className="d-flex flex-column align-items-center align-items-lg-end text-lg-end text-center">
                        <div className="qr-container-district">
                            {/* SVG representing a clean, professional QR Code */}
                            <svg className="qr-code-svg" width="90" height="90" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1h7v7H1V1zm1 1v5h5V2H2zm1 1h3v3H3V3zm6-2h1v1H9V1zm0 2h1v3H9V3zm0 4h1v1H9V7zM1 9h1v1H1V9zm2 0h2v1H3V9zm3 0h2v2H6V9zm0 2h1v1H6v-1zm2-2h1v2H8V9zm0 2h1v1H8v-1zm3-10h7v7h-7V1zm1 1v5h5V2h-5zm1 1h3v3h-3V3zm6-2h2v1h-2V1zm1 2h1v1h-1V3zm-1 2h2v1h-2V5zm1 2h1v1h-1V7zm-9 2h1v1h-1V9zm0 2h2v1h-2v-1zm3-2h2v1h-2V9zm0 2h1v1h-1v-1zm2-2h1v2h-1V9zm1 2h2v1h-2v-1zm-9 3h7v7H1v-7zm1 1v5h5v-5H2zm1 1h3v3H3v-3zm6-2h1v2H9v-2zm0 3h1v1H9v-1zm0 2h1v1H9v-1zm2-3h1v1h-1v-1zm0 2h2v1h-2v-1zm0 2h1v1h-1v-1zm2-4h1v1h-1v-1zm0 2h1v2h-1v-2zm2-2h1v1h-1v-1zm0 2h1v1h-1v-1zm0 2h1v1h-1v-1zm2-4h2v1h-2v-1zm0 2h1v1h-1v-1zm0 2h2v1h-2v-1zm-6 4h1v1H9v-1zm0 2h2v1H9v-1zm3-2h1v1h-1v-1zm0 2h1v1h-1v-1zm2-2h2v1h-2v-1zm0 2h1v1h-1v-1zm2-2h1v1h-1v-1zm0 2h1v1h-1v-1z" fill="#FFFFFF"/>
                            </svg>
                        </div>
                        <span className="qr-text-district">Scan to access platform</span>
                    </Col>
                </Row>

                <hr className="footer-divider-district" />

                <Row className="align-items-center gy-3 mt-1">
                    {/* Disclaimer Column */}
                    <Col md={8} className="text-md-start text-center">
                        <p className="footer-disclaimer-district m-0">
                            By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines. All rights reserved.
                        </p>
                    </Col>

                    {/* Social Icons Column */}
                    <Col md={4} className="d-flex justify-content-md-end justify-content-center gap-3">
                        <a href="https://wa.me/9175843059" target="_blank" rel="noopener noreferrer" className="social-link-district" aria-label="WhatsApp">
                            <FaWhatsapp size={16} />
                        </a>
                        <a href="https://www.facebook.com/share/1AWNViGDuE/" target="_blank" rel="noopener noreferrer" className="social-link-district" aria-label="Facebook">
                            <FaFacebookF size={15} />
                        </a>
                        <a href="https://www.instagram.com/growthutsav?igsh=NHZxaHdlbDk5dWNt" target="_blank" rel="noopener noreferrer" className="social-link-district" aria-label="Instagram">
                            <FaInstagram size={16} />
                        </a>
                        <a href="#" className="social-link-district" aria-label="Twitter">
                            <FaTwitter size={15} />
                        </a>
                        <a href="#" className="social-link-district" aria-label="YouTube">
                            <FaYoutube size={16} />
                        </a>
                    </Col>
                </Row>
            </div>
        </footer>
    );
};

export default Footer;
