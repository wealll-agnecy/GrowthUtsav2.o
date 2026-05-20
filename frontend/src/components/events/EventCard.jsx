import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUtensils } from 'react-icons/fa';
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
    console.log(`DEBUG [EventCard]: ${event?.title} - Food Type:`, event?.foodSettings?.type);

    return (
        <div 
            className="event-card" 
            role="button"
            tabIndex="0"
            aria-label={`View details for ${event?.title || 'event'}`}
            onClick={() => navigate(`/events/${event?._id}`)}
            onKeyDown={(e) => { if(e.key === 'Enter') navigate(`/events/${event?._id}`) }}
        >
            <div className="event-image-wrapper">
                <img 
                    src={bannerUrl} 
                    alt={event?.title || 'Event banner'} 
                    className="event-image" 
                    loading="lazy" 
                    decoding="async"
                    width="400"
                    height="250"
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

                {/* Food Banners on Image */}
                {(event?.foodSettings?.foodType === 'compulsory' || event?.foodSettings?.type === 'compulsory') && (
                    <div className="food-banner-ribbon compulsory">
                        FOOD INCLUDED
                    </div>
                )}
                {(event?.foodSettings?.foodType === 'multiple' || event?.foodSettings?.type === 'multiple') && (
                    <div className="food-banner-ribbon multiple">
                        YOU CAN SELECT YOUR MEAL
                    </div>
                )}
            </div>

            <div className="event-content">
                <h3 className="event-title">{event?.title || 'Event Name'}</h3>
                <div className="event-food-info">
                    {event?.foodSettings?.type === 'compulsory' && (
                        <div className="food-tag tag-compulsory">
                            <FaUtensils size={10} className="me-1" /> Food Included
                        </div>
                    )}
                    {event?.foodSettings?.type === 'multiple' && (
                        <div className="food-tag tag-multiple">
                            <FaUtensils size={10} className="me-1" /> You can choose the food
                        </div>
                    )}
                </div>
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

