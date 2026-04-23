import { useNavigate } from 'react-router-dom';
import '../../css/cards.css';
import '../../css/global.css';

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

    const ticketsLeft = event?.ticketTypes?.reduce((acc, tier) => acc + (tier.quantity - (tier.sold || 0)), 0) || 10;

    const bannerUrl = (event?.bannerImage && event?.bannerImage !== 'no-photo.jpg' && !event?.bannerImage.startsWith('http'))
        ? `http://localhost:5000/uploads/${event.bannerImage}`
        : (event?.bannerImage && event?.bannerImage.startsWith('http'))
            ? event.bannerImage
            : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';

    return (
        <div
            onClick={() => navigate(`/events/${event?._id}`)}
            className="minimal-card"
            role="button"
            tabIndex={0}
        >
            <div className="card-img">
                <img
                    src={bannerUrl}
                    alt={event?.title || 'Bridal Makeup'}
                    loading="lazy"
                />
                {ticketsLeft > 0 && (
                    <div className="ticket-badge">
                        Hurry, {ticketsLeft} tickets left
                    </div>
                )}
            </div>

            <div className="card-body">
                <h5>{event?.title || 'Bridal Makeup Session'}</h5>
                <p>{event?.description?.length > 60 ? event.description.substring(0, 60) + '...' : (event?.description || 'Premium styling with expert artists.')}</p>

                <div className="card-meta">
                    <span>{formattedDate}</span>
                    <span>{event?.venue || 'Venue TBA'}</span>
                </div>

                <div className="card-bottom">
                    <span className="price">₹{minPrice}</span>
                    <button 
                        className="btn btn-pink btn-sm"
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
