import { FaMapMarkerAlt, FaCalendarAlt, FaStar, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './EventCard.css';

const EventCard = ({ event }) => {
    const navigate = useNavigate();
    
    const formattedDate = event?.date ? new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : 'TBA';

    const ticketPrices = event?.ticketTypes?.map(t => t.price) || [0];
    const minPrice = ticketPrices.length > 0 ? Math.min(...ticketPrices) : 0;
    const hasTickets = ticketPrices.length > 0;

    const bannerUrl = (event?.bannerImage && event?.bannerImage !== 'no-photo.jpg' && !event?.bannerImage.startsWith('http'))
        ? `http://localhost:5000/uploads/${event.bannerImage}`
        : (event?.bannerImage && event?.bannerImage.startsWith('http'))
            ? event.bannerImage
            : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';

    return (
        <div
            onClick={() => navigate(`/events/${event?._id}`)}
            className="event-card glass-card h-100 position-relative overflow-hidden tilt-3d cursor-pointer text-decoration-none"
            role="button"
            tabIndex={0}
        >
            {/* Card Image with Mask */}
            <div className="card-img-wrapper position-relative overflow-hidden img-aspect-ratio-default">
                <img
                    src={bannerUrl}
                    alt={event?.title || 'GrowthUtsav Event'}
                    loading="lazy"
                    className="w-100 h-100 object-fit-cover transition-all img-optimized"
                />

                <div
                    className="position-absolute inset-0 gradient-overlay-bottom"
                />

                {/* Status Badges */}
                <div className="position-absolute top-0 end-0 p-2 p-md-3 d-flex flex-column gap-1 gap-md-2 badge-container-stack">
                    <Badge className="bg-primary-subtle text-primary rounded-pill px-2 py-1 px-md-3 py-md-2 fw-semibold tracking-wider small">
                        {event?.category || 'General'}
                    </Badge>
                    {event?.isPremium && (
                        <Badge className="bg-warning text-dark rounded-pill px-2 py-1 px-md-3 py-md-2 fw-semibold small shadow-sm">
                            <FaStar className="me-1" /> Elite
                        </Badge>
                    )}
                </div>

                {/* Quick Date Tag */}
                <div className="position-absolute bottom-0 start-0 p-2 p-md-3 date-tag-badge">
                    <div className="glass-panel backdrop-blur-md rounded-3 px-2 py-1 px-md-3 py-md-2 d-inline-flex align-items-center gap-2 shadow-2xl">
                        <FaCalendarAlt className="text-primary-light" size={10} />
                        <span className="text-white fw-bold x-small date-tag-text">{formattedDate}</span>
                    </div>
                </div>
            </div>


            {/* Card Content */}
            <div className="card-body p-4 pt-3 d-flex flex-column gap-3 bg-transparent">
                <h4 className="fw-bold text-bright m-0 line-clamp-2 lh-base card-title-main">
                    {event?.title || 'Untitled Event'}
                </h4>

                <div className="d-flex align-items-center gap-2 text-soft small fw-normal">
                    <FaMapMarkerAlt className="text-primary-light" size={14} />
                    <span className="text-truncate">{event?.venue || 'Venue TBA'}</span>
                </div>

                <div className="mt-auto pt-3 border-top border-white/5 d-flex flex-row flex-md-row justify-content-between align-items-center gap-2">
                    <div className="flex-grow-1">
                        <p className="text-soft small fw-semibold uppercase tracking-wider m-0 access-label-small">ACCESS</p>
                        <h4 className="fw-bold m-0 h4 text-primary-light price-text-primary">
                            ₹{minPrice}
                        </h4>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        className="btn-primary rounded-pill px-4 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all ticket-btn-pill"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event?._id}`);
                        }}
                    >
                        TICKETS <FaArrowRight size={10} />
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default EventCard;
