import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import './EventCard.css';
import API_BASE_URL from '../../config/apiConfig';

import { formatCurrency, resolveImageUrl } from '../../utils/formatUtils';

const EventCard = ({ event }) => {
    const navigate = useNavigate();
    
    const formattedDate = event?.date ? new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    }) : 'TBA';

    const ticketPrices = event?.ticketTypes?.map(t => t.price) || [0];
    const minPrice = ticketPrices.length > 0 ? Math.min(...ticketPrices) : 0;

    const bannerUrl = resolveImageUrl(event?.eventImage || event?.bannerImage);

    return (
        <div 
            className="event-card" 
            onClick={() => navigate(`/events/${event?._id}`)}
        >
            <div className="event-image-wrapper">
                <img 
                    src={bannerUrl} 
                    alt={event?.title} 
                    className="event-image" 
                    loading="lazy" 
                    decoding="async" 
                />
                <div className="event-overlay"></div>
                
                {/* floating badges */}
                <span className="category-badge">
                    {event?.category || 'Special'}
                </span>
                
                {(event?.isLive || event?.status === 'live' || event?.isTrending) && (
                    <span className="fast-selling">
                        {event?.isLive ? 'LIVE NOW' : 'Selling Fast'}
                    </span>
                )}
            </div>

            <div className="event-content">
                <h3 className="event-title">{event?.title || 'Event Name'}</h3>
                <p className="event-subtitle">Exclusive Event Experience</p>

                <div className="event-meta">
                    <div className="meta-item">
                        <FaMapMarkerAlt size={12} />
                        <span>{event?.venue?.split(',')[0] || 'Venue TBA'}</span>
                    </div>
                    <div className="meta-item">
                        <FaCalendarAlt size={12} />
                        <span>{formattedDate}</span>
                    </div>
                </div>

                <div className="event-footer">
                    <div className="event-price">
                        <span className="price-label">Starts from</span>
                        <span className="price-value">{formatCurrency(minPrice)}</span>
                    </div>
                    
                    <button 
                        className="event-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event?._id}`);
                        }}
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;

