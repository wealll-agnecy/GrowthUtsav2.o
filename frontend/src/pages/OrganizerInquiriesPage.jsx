import React from 'react';
import { Container } from 'react-bootstrap';
import OrganizerInquiries from './OrganizerInquiries';

const OrganizerInquiriesPage = () => {
    return (
        <div className="dashboard-page" style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #f3e8ff 100%)', minHeight: '100vh' }}>
            <Container fluid className="px-md-5 py-5">
                <div className="dashboard-header mb-4">
                    <h2 className="dashboard-title-main">Enquiries</h2>
                    <p className="dashboard-subtext">Manage questions and messages from attendees regarding your events.</p>
                </div>
                
                <OrganizerInquiries />
            </Container>
        </div>
    );
};

export default OrganizerInquiriesPage;
