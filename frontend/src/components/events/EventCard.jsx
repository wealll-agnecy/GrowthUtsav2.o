import { useNavigate } from 'react-router-dom';
import '../../pages/EventListing.css'; // Importing the styles we just added

const EventCard = ({ event }) => {
    const navigate = useNavigate();
    
    const formattedDate = event?.date ? new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : 'TBA';

    const ticketPrices = event?.ticketTypes?.map(t => t.price) || [0];
    const minPrice = ticketPrices.length > 0 ? Math.min(...ticketPrices) : 0;

    const bannerUrl = (event?.bannerImage && event?.bannerImage !== 'no-photo.jpg' && !event?.bannerImage.startsWith('http'))
        ? `http://localhost:5000/uploads/${event.bannerImage}`
        : (event?.bannerImage && event?.bannerImage.startsWith('http'))
            ? event.bannerImage
            : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';

    return (
        <div 
            className="event-card" 
            onClick={() => navigate(`/events/${event?._id}`)}
        >
            <div className="event-img-wrapper">
                <img 
                    src={bannerUrl} 
                    alt={event?.title} 
                    className="event-img" 
                    loading="lazy" 
                    decoding="async" 
                />
                {event?.isLive || event?.status === 'live' ? (
                    <span className="event-badge live-pulse">LIVE NOW</span>
                ) : (
                    <span className="event-badge">Trending</span>
                )}
                <span className="event-price-badge">₹{minPrice}</span>
            </div>

            <div className="event-content">
                <h3 className="event-title">{event?.title || 'Event Name'}</h3>

                <div className="event-subinfo">
                    <span>📍 {event?.venue || 'Venue TBA'}</span>
                    <span>📅 {formattedDate}</span>
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
    );
};

export default EventCard;

