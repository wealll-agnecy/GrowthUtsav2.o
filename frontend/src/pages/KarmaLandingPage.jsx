import React from 'react';
import { useNavigate } from 'react-router-dom';
import './KarmaLandingPage.css';

const plans = [
  {
    name: 'Package 1',
    price: '₹20,000',
    desc: 'BREAKFAST | LUNCH | HI-TEA',
    featured: false,
    badge: null,
    features: [
      'LEARN 2 COMPLETE LOOKS EVERY DAY (MAKEUP & HAIR)',
      'PARTICIPANTS WILL RECEIVE A FRAMED CERTIFICATE',
      'A CUSTOMISED TROPHY',
      'SELFIE WITH THE JASMINE BEAUTY CARE TEAM',
    ],
  },
  {
    name: 'Package 2',
    price: '₹30,000',
    desc: 'BREAKFAST | LUNCH | HI-TEA',
    featured: true,
    badge: 'Premium Package',
    features: [
      'LEARN 2 COMPLETE LOOKS EVERY DAY (MAKEUP & HAIR)',
      'PRIVATE HANDS-ON PRACTICE SESSIONS BY TEAM JASMINE BEAUTY CARE',
      'PARTICIPANTS WILL RECEIVE A FRAMED CERTIFICATE',
      'A CUSTOMISED TROPHY',
      'SELFIE WITH THE ENTIRE TEAM',
    ],
  },
];

const highlights = [
  { icon: '🎤', title: 'Celebrity Mentors', text: 'Learn from the best in the beauty industry.' },
  { icon: '🤝', title: 'Hands-on Practice', text: 'Private practice sessions for Package 2 attendees.' },
  { icon: '✨', title: 'Luxury Experience', text: 'Premium venue, gourmet catering and 5-star hospitality.' },
  { icon: '🏆', title: 'Live Awards', text: 'Celebrate the best brands and entrepreneurs in style.' },
  { icon: '📸', title: 'Content Studio', text: 'Professional photo & reel shoots for your brand story.' },
  { icon: '🚀', title: 'Growth Workshops', text: 'Hands-on sessions to scale your business in 2025.' },
];

export default function KarmaLandingPage() {
  const navigate = useNavigate();

  const handleBookNow = (plan) => {
    navigate('/karma-booking', { state: { plan } });
  };

  return (
    <div className="karma-page">

      {/* ── HERO SECTION ── */}
      <section className="karma-hero">
        <div className="karma-hero-glow" />
        <div className="karma-hero-glow-left" />

        <div className="container-fluid">
          <div className="row align-items-center g-5">

            {/* Left: Text */}
            <div className="col-lg-6">
              <div className="karma-badge">
                <div className="karma-badge-dot" />
                <span>The Ultimate Lifestyle Event</span>
              </div>

              <h1 className="karma-headline">
                Karma <span className="karma-headline-gold">International</span>
                <br />
                <span style={{ fontSize: '55%', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>
                  2026 MEGA EDITION
                </span>
              </h1>

              <p className="karma-subtext mb-5">
                Join the elite network of creators, founders, and lifestyle icons.
                Elevate your brand and experience the most premium networking
                event of the year.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-5">
                <button className="karma-btn-primary" onClick={() => handleBookNow('Package 1')}>
                  Book Package 1
                </button>
                <button className="karma-btn-outline" onClick={() => handleBookNow('Package 2')}>
                  Book Package 2 ✦
                </button>
              </div>

              {/* Stats */}
              <div className="d-flex flex-wrap gap-3">
                <div className="karma-stat-card">
                  <div className="karma-stat-number">500+</div>
                  <p className="karma-stat-label">Elite Guests</p>
                </div>
                <div className="karma-stat-card">
                  <div className="karma-stat-number">20+</div>
                  <p className="karma-stat-label">Celebrity Speakers</p>
                </div>
                <div className="karma-stat-card">
                  <div className="karma-stat-number">VIP</div>
                  <p className="karma-stat-label">Luxury Experience</p>
                </div>
              </div>
            </div>

            {/* Right: Celebrity Card */}
            <div className="col-lg-6">
              <div className="karma-celebrity-wrap">
                <div className="karma-celebrity-glow" />
                <div className="karma-celebrity-card">
                  <img
                    src="/hero-image.jpg"
                    alt="Karma International Hosts"
                  />
                  <div className="karma-celebrity-overlay" />
                  <div className="karma-celebrity-info">
                    <div className="karma-celebrity-tag">
                      <span>⭐ Main Celebrity Guest</span>
                    </div>
                    <h2 className="karma-celebrity-name">Karma Masters</h2>
                    <p className="karma-celebrity-desc">
                      Meet the visionaries behind the most exclusive lifestyle and business networking event.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <hr className="karma-divider" />

      {/* ── HIGHLIGHTS SECTION ── */}
      <section className="karma-highlights">
        <div className="container">
          <p className="karma-details-label text-center mb-2">What Awaits You</p>
          <h2 className="karma-section-title">Event Highlights</h2>
          <p className="karma-section-sub">Everything you need to grow, connect and be inspired.</p>

          <div className="row g-4">
            {highlights.map((h, i) => (
              <div className="col-sm-6 col-lg-4" key={i}>
                <div className="karma-highlight-card">
                  <div className="karma-highlight-icon">{h.icon}</div>
                  <div className="karma-highlight-title">{h.title}</div>
                  <p className="karma-highlight-text">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="karma-divider" />

      {/* ── PLANS SECTION ── */}
      <section className="karma-plans-section">
        <div className="container">
          <p className="karma-details-label text-center mb-2">Choose Your Experience</p>
          <h2 className="karma-section-title">Select Your Pass</h2>
          <p className="karma-section-sub">Every tier is crafted for a premium, life-changing experience.</p>

          <div className="row g-4 justify-content-center">
            {plans.map((plan, i) => (
              <div className="col-md-6 col-lg-4" key={i}>
                <div className={`karma-plan-card ${plan.featured ? 'featured' : ''} d-flex flex-column`}>
                  {plan.badge && (
                    <span className="karma-plan-badge">{plan.badge}</span>
                  )}
                  <div className="karma-plan-name">{plan.name}</div>
                  <div className="karma-plan-price">
                    {plan.price} <span>/ person</span>
                  </div>
                  <p className="karma-plan-desc mt-2">{plan.desc}</p>

                  <div className="mb-4 flex-grow-1">
                    {plan.features.map((f, j) => (
                      <div className="karma-plan-feature" key={j}>
                        <div className="karma-plan-feature-dot" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <button
                    className={plan.featured ? 'karma-btn-primary w-100' : 'karma-btn-outline w-100'}
                    onClick={() => handleBookNow(plan.name)}
                  >
                    Book {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="karma-divider" />




      {/* ── FINAL CTA STRIP ── */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(180deg, rgba(245,158,11,0.04) 0%, #000 100%)' }}>
        <div className="container text-center">
          <p className="karma-details-label mb-3">Limited Seats Available</p>
          <h2 className="karma-section-title mb-3">Ready to Join the Masterclass?</h2>
          <p className="karma-section-sub mb-5" style={{ marginBottom: '0 auto' }}>
            Secure your spot now before packages sell out.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <button className="karma-btn-primary" onClick={() => handleBookNow('Package 1')}>
              Book Package 1
            </button>
            <button className="karma-btn-outline" onClick={() => handleBookNow('Package 2')}>
              Book Package 2 ✦
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER STRIP ── */}
      <div className="karma-footer-strip">
        <p>© 2026 Karma International · Powered by Karma · All Rights Reserved</p>
      </div>

    </div>
  );
}
