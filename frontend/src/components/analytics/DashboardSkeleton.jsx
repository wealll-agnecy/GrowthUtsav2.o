import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const DashboardSkeleton = () => {
    return (
        <div className="dashboard-content-premium">
            {/* Header Skeleton */}
            <div className="mb-5">
                <div className="skeleton mb-3" style={{ width: '150px', height: '24px' }}></div>
                <div className="skeleton mb-2" style={{ width: '300px', height: '48px' }}></div>
                <div className="skeleton opacity-50" style={{ width: '450px', height: '20px' }}></div>
            </div>

            {/* Stats Grid */}
            <Row className="g-4 mb-5">
                {[1, 2, 3, 4].map(i => (
                    <Col key={i} lg={3} md={6}>
                        <Card className="saas-card p-4 border-0 shadow-2xl">
                            <div className="d-flex align-items-center gap-3">
                                <div className="skeleton rounded-4" style={{ width: '50px', height: '50px' }}></div>
                                <div className="flex-grow-1">
                                    <div className="skeleton mb-2" style={{ width: '60%', height: '12px' }}></div>
                                    <div className="skeleton" style={{ width: '80%', height: '24px' }}></div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Main Content Area */}
            <Row className="g-4">
                <Col lg={8}>
                    <Card className="saas-card p-5 border-0 shadow-2xl h-100" style={{ minHeight: '400px' }}>
                        <div className="skeleton mb-5" style={{ width: '200px', height: '24px' }}></div>
                        <div className="skeleton w-100 h-100 opacity-50" style={{ minHeight: '300px' }}></div>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="saas-card p-5 border-0 shadow-2xl h-100">
                        <div className="skeleton mb-4" style={{ width: '150px', height: '20px' }}></div>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="mb-4 d-flex gap-3 align-items-center">
                                <div className="skeleton rounded-circle" style={{ width: '40px', height: '40px' }}></div>
                                <div className="flex-grow-1">
                                    <div className="skeleton mb-2" style={{ width: '70%', height: '10px' }}></div>
                                    <div className="skeleton" style={{ width: '40%', height: '8px' }}></div>
                                </div>
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardSkeleton;
