import React from "react";
import { Event } from "../../types/event";

interface SimpleEventCardProps {
  event: Event;
  onUpdate: () => Promise<void>;
}

const SimpleEventCard: React.FC<SimpleEventCardProps> = ({
  event,
  onUpdate: _onUpdate,
}) => {
  return (
    <div className="bg-white rounded-royal shadow-lg p-6 border border-royal-gold/20">
      <h3 className="text-lg font-bold text-royal-charcoal mb-2">
        {event.title}
      </h3>
      <p className="text-royal-charcoal/70 mb-4">{event.description}</p>
      <div className="text-sm text-royal-charcoal/60">
        <p>Date: {new Date(event.date).toLocaleDateString()}</p>
        <p>Category: {event.category}</p>
        {event.price && <p>Price: €{event.price}</p>}
      </div>
    </div>
  );
};

export default SimpleEventCard;
